import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { Message } from '../messages/message.entity';
import { RoomsService } from '../rooms/rooms.service';
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
    private readonly configService: ConfigService
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

    const storageDriver = this.configService.get<string>('storage.driver') ?? 'local';
    if (storageDriver !== 'local') {
      throw new ForbiddenException('Only local storage is implemented in this phase');
    }

    const uploadsRoot = path.resolve(
      process.cwd(),
      this.configService.get<string>('storage.localUploadDir') ?? './backend/uploads'
    );
    const companyDir = path.join(uploadsRoot, actor.companyId);
    await fs.mkdir(companyDir, { recursive: true });

    const safeName = `${randomUUID()}-${sanitizeName(file.originalname)}`;
    const absolutePath = path.join(companyDir, safeName);
    await fs.writeFile(absolutePath, file.buffer);

    const storedFile = await this.filesRepository.save(
      this.filesRepository.create({
        companyId: actor.companyId,
        roomId: dto.roomId,
        messageId: dto.messageId ?? null,
        uploadedBy: actor.sub,
        originalName: file.originalname,
        storedName: safeName,
        mimeType: file.mimetype || 'application/octet-stream',
        size: file.size,
        storageDriver,
        storagePath: absolutePath
      })
    );

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
}

function sanitizeName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}
