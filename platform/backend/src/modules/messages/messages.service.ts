import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { UserRole } from '../../common/enums/user-role.enum';
import { RoomsService } from '../rooms/rooms.service';
import { CreateMessageDto, ListMessagesQueryDto, ReactToMessageDto, UpdateMessageDto } from './messages.dto';
import { MessageReaction } from './message-reaction.entity';
import { Message } from './message.entity';

interface AuthUser {
  sub: string;
  companyId: string;
  role: UserRole;
}

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    @InjectRepository(MessageReaction)
    private readonly reactionsRepository: Repository<MessageReaction>,
    private readonly roomsService: RoomsService
  ) {}

  async list(query: ListMessagesQueryDto, actor: AuthUser) {
    await this.roomsService.ensureMembership(query.roomId, actor);

    const messages = await this.messagesRepository.find({
      where: {
        roomId: query.roomId,
        companyId: actor.companyId,
        deletedAt: IsNull()
      },
      relations: { reactions: true },
      order: { createdAt: 'DESC' },
      take: query.limit ?? 25
    });

    return {
      success: true,
      data: messages.reverse(),
      error: null,
      meta: { limit: query.limit ?? 25 }
    };
  }

  async create(dto: CreateMessageDto, actor: AuthUser) {
    await this.roomsService.ensureMembership(dto.roomId, actor);

    if (dto.parentMessageId) {
      const parent = await this.messagesRepository.findOne({
        where: {
          id: dto.parentMessageId,
          roomId: dto.roomId,
          companyId: actor.companyId
        }
      });
      if (!parent) {
        throw new NotFoundException('Parent message not found');
      }
    }

    const message = await this.messagesRepository.save(
      this.messagesRepository.create({
        companyId: actor.companyId,
        roomId: dto.roomId,
        senderId: actor.sub,
        content: dto.content,
        type: dto.type,
        parentMessageId: dto.parentMessageId ?? null,
        metadata: dto.parentMessageId ? { threaded: true } : null
      })
    );

    const fullMessage = await this.messagesRepository.findOneOrFail({
      where: { id: message.id },
      relations: { reactions: true }
    });

    return { success: true, data: fullMessage, error: null, meta: null };
  }

  async update(messageId: string, dto: UpdateMessageDto, actor: AuthUser) {
    const message = await this.messagesRepository.findOne({
      where: { id: messageId, companyId: actor.companyId }
    });
    if (!message || message.deletedAt) {
      throw new NotFoundException('Message not found');
    }

    await this.roomsService.ensureMembership(message.roomId, actor);
    if (message.senderId !== actor.sub) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    message.content = dto.content;
    message.editedAt = new Date();
    const saved = await this.messagesRepository.save(message);
    return { success: true, data: saved, error: null, meta: null };
  }

  async remove(messageId: string, actor: AuthUser) {
    const message = await this.messagesRepository.findOne({
      where: { id: messageId, companyId: actor.companyId }
    });
    if (!message || message.deletedAt) {
      throw new NotFoundException('Message not found');
    }

    await this.roomsService.ensureMembership(message.roomId, actor);
    if (message.senderId !== actor.sub && ![UserRole.COMPANY_ADMIN, UserRole.MASTER_ADMIN].includes(actor.role)) {
      throw new ForbiddenException('You do not have permission to delete this message');
    }

    message.deletedAt = new Date();
    const saved = await this.messagesRepository.save(message);
    return { success: true, data: saved, error: null, meta: null };
  }

  async react(messageId: string, dto: ReactToMessageDto, actor: AuthUser) {
    const message = await this.messagesRepository.findOne({
      where: { id: messageId, companyId: actor.companyId }
    });
    if (!message || message.deletedAt) {
      throw new NotFoundException('Message not found');
    }

    await this.roomsService.ensureMembership(message.roomId, actor);

    const reaction = await this.reactionsRepository.save(
      this.reactionsRepository.create({
        companyId: actor.companyId,
        messageId,
        userId: actor.sub,
        emoji: dto.emoji
      })
    );

    return {
      success: true,
      data: reaction,
      error: null,
      meta: { roomId: message.roomId }
    };
  }
}
