import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { ForbiddenException, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateMessageDto } from './messages.dto';
import { MessagesService } from './messages.service';
import { RoomsService } from '../rooms/rooms.service';

interface SocketUser {
  sub: string;
  companyId: string;
  email: string;
  role: UserRole;
}

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(MessagesGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly roomsService: RoomsService,
    private readonly messagesService: MessagesService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      const payload = await this.jwtService.verifyAsync<SocketUser>(token, {
        secret: this.configService.getOrThrow<string>('jwt.accessSecret')
      });

      client.data.user = payload;
      client.emit('presence.changed', { userId: payload.sub, status: 'online' });
    } catch {
      this.logger.warn(`Rejected socket connection ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user as SocketUser | undefined;
    if (user) {
      client.broadcast.emit('presence.changed', { userId: user.sub, status: 'offline' });
    }
  }

  @SubscribeMessage('join_room')
  async joinRoom(@MessageBody('roomId') roomId: string, @ConnectedSocket() client: Socket) {
    const user = this.getSocketUser(client);
    await this.roomsService.ensureMembership(roomId, user);
    await client.join(roomId);
    client.emit('room.joined', { roomId });
  }

  @SubscribeMessage('leave_room')
  async leaveRoom(@MessageBody('roomId') roomId: string, @ConnectedSocket() client: Socket) {
    await client.leave(roomId);
    client.emit('room.left', { roomId });
  }

  @SubscribeMessage('typing_start')
  async typingStart(@MessageBody('roomId') roomId: string, @ConnectedSocket() client: Socket) {
    const user = this.getSocketUser(client);
    await this.roomsService.ensureMembership(roomId, user);
    client.to(roomId).emit('typing.started', { roomId, userId: user.sub });
  }

  @SubscribeMessage('typing_stop')
  async typingStop(@MessageBody('roomId') roomId: string, @ConnectedSocket() client: Socket) {
    const user = this.getSocketUser(client);
    await this.roomsService.ensureMembership(roomId, user);
    client.to(roomId).emit('typing.stopped', { roomId, userId: user.sub });
  }

  @SubscribeMessage('message.create')
  async createMessage(
    @MessageBody() payload: CreateMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    const user = this.getSocketUser(client);
    const result = await this.messagesService.create(payload, user);
    this.server.to(payload.roomId).emit('message.created', result.data);
    return result;
  }

  emitMessageCreated(roomId: string, payload: unknown) {
    this.server.to(roomId).emit('message.created', payload);
  }

  emitMessageUpdated(roomId: string, payload: unknown) {
    this.server.to(roomId).emit('message.updated', payload);
  }

  emitMessageDeleted(roomId: string, payload: unknown) {
    this.server.to(roomId).emit('message.deleted', payload);
  }

  emitReactionAdded(roomId: string, payload: unknown) {
    this.server.to(roomId).emit('reaction.added', payload);
  }

  private extractToken(client: Socket) {
    const authToken = client.handshake.auth?.token as string | undefined;
    const bearerHeader = client.handshake.headers.authorization;
    const headerToken = bearerHeader?.startsWith('Bearer ') ? bearerHeader.slice(7) : undefined;
    const token = authToken ?? headerToken;

    if (!token) {
      throw new UnauthorizedException('Missing websocket auth token');
    }

    return token;
  }

  private getSocketUser(client: Socket): SocketUser {
    const user = client.data.user as SocketUser | undefined;
    if (!user) {
      throw new ForbiddenException('Unauthenticated socket');
    }

    return user;
  }
}
