import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../rooms/room.entity';
import { User } from '../users/user.entity';
import { UpdateAdminUserDto } from './admin.dto';

interface AuthUser {
  companyId: string;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>
  ) {}

  async listUsers(actor: AuthUser) {
    const users = await this.usersRepository.find({
      where: { companyId: actor.companyId },
      order: { createdAt: 'DESC' }
    });

    return { success: true, data: users, error: null, meta: null };
  }

  async updateUser(userId: string, dto: UpdateAdminUserDto, actor: AuthUser) {
    const user = await this.usersRepository.findOne({
      where: { id: userId, companyId: actor.companyId }
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, dto);
    const saved = await this.usersRepository.save(user);
    return { success: true, data: saved, error: null, meta: null };
  }

  async listRooms(actor: AuthUser) {
    const rooms = await this.roomsRepository.find({
      where: { companyId: actor.companyId },
      order: { createdAt: 'DESC' }
    });
    return { success: true, data: rooms, error: null, meta: null };
  }

  async archiveRoom(roomId: string, actor: AuthUser) {
    const room = await this.roomsRepository.findOne({
      where: { id: roomId, companyId: actor.companyId }
    });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    room.deletedAt = new Date();
    const saved = await this.roomsRepository.save(room);
    return { success: true, data: saved, error: null, meta: null };
  }
}
