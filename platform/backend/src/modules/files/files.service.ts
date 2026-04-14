import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../messages/message.entity';
import { RoomsService } from '../rooms/rooms.service';
import { StorageService } from '../../shared/storage/storage.service';
import { UploadFileDto } from './files.dto';
import { StoredFile } from './file.entity';

interface AuthUser {
  sub: string;
  companyId: string;
  role: string;
}

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(StoredFile)
    private readonly filesRepository: Repository<StoredFile>,
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    private readonly roomsService: RoomsService,
    private readonly configService: ConfigService,
    private readonly storageService: StorageService
  ) {}

  async upload(file: Express.Multer.File, dto: UploadFileDto, actor: AuthUser) {
    await this.roomsService.ensureMembership(dto.roomId, actor as any);

    if (!file) {
      throw new ForbiddenException('File is required');
    }

    if (dto.messageId) {
      const message = await this.messagesRepository.findOne({
        where: {
          id: dto.messageId,
          companyId: actor.companyId,
          roomId: dto.roomId
        }
      });

      if (!message) {
        throw new NotFoundException('Message not found for file attachment');
      }
    }

    this.ensureAllowedFile(file);
    const storedObject = await this.storageService.storeFile({
      companyId: actor.companyId,
      fileName: file.originalname,
      contentType: file.mimetype || 'application/octet-stream',
      buffer: file.buffer
    });

    let storedFile = await this.filesRepository.save(
      this.filesRepository.create({
        companyId: actor.companyId,
        roomId: dto.roomId,
        messageId: dto.messageId ?? null,
        uploadedBy: actor.sub,
        originalName: file.originalname,
        storedName: storedObject.storedName,
        fileUrl: null,
        mimeType: file.mimetype || 'application/octet-stream',
        size: file.size,
        storageDriver: storedObject.driver,
        storagePath: storedObject.storagePath
      })
    );

    storedFile.fileUrl = this.buildFileUrl(storedFile.id);
    storedFile = await this.filesRepository.save(storedFile);

    return { success: true, data: storedFile, error: null, meta: null };
  }

  async getMetadata(id: string, actor: AuthUser) {
    const storedFile = await this.filesRepository.findOne({
      where: { id, companyId: actor.companyId }
    });
    if (!storedFile) {
      throw new NotFoundException('File not found');
    }

    await this.roomsService.ensureMembership(storedFile.roomId, actor as any);
    return { success: true, data: storedFile, error: null, meta: null };
  }

  async resolveDownload(id: string, actor: AuthUser) {
    const storedFile = await this.filesRepository.findOne({
      where: { id, companyId: actor.companyId }
    });
    if (!storedFile) {
      throw new NotFoundException('File not found');
    }

    await this.roomsService.ensureMembership(storedFile.roomId, actor as any);
    return storedFile;
  }

  async attachFilesToMessage(
    fileIds: string[] | undefined,
    roomId: string,
    messageId: string,
    actor: AuthUser
  ) {
    if (!fileIds?.length) {
      return [];
    }

    const files = await this.filesRepository.find({
      where: fileIds.map((id) => ({
        id,
        companyId: actor.companyId,
        roomId
      }))
    });

    if (files.length !== fileIds.length) {
      throw new NotFoundException('One or more files were not found');
    }

    const invalid = files.find((file) => file.messageId && file.messageId !== messageId);
    if (invalid) {
      throw new ForbiddenException('A file is already attached to another message');
    }

    for (const file of files) {
      file.messageId = messageId;
    }

    return this.filesRepository.save(files);
  }

  async openDownload(storedFile: StoredFile) {
    return this.storageService.openDownload(storedFile.storagePath);
  }

  private ensureAllowedFile(file: Express.Multer.File) {
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new ForbiddenException('File exceeds the temporary upload limit');
    }
  }

  private buildFileUrl(fileId: string) {
    const frontendUrl = this.configService.get<string>('app.frontendUrl') ?? 'http://localhost:3000';
    return `${frontendUrl.replace(/\/$/, '')}/api/v1/files/${encodeURIComponent(fileId)}/download`;
  }
}
