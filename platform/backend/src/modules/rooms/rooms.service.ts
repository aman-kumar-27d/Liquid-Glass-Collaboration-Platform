import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomMemberRole } from '../../common/enums/room-member-role.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../users/user.entity';
import { RoomMember } from './room-member.entity';
import { Room } from './room.entity';
import { AddRoomMemberDto, CreateRoomDto, ListRoomsQueryDto } from './rooms.dto';

interface AuthUser {
  sub: string;
  companyId: string;
  role: UserRole;
}

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,
    @InjectRepository(RoomMember)
    private readonly roomMembersRepository: Repository<RoomMember>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  async create(dto: CreateRoomDto, actor: AuthUser) {
    const room = await this.roomsRepository.save(
      this.roomsRepository.create({
        companyId: actor.companyId,
        name: dto.name,
        type: dto.type,
        createdBy: actor.sub
      })
    );

    await this.roomMembersRepository.save(
      this.roomMembersRepository.create({
        roomId: room.id,
        userId: actor.sub,
        role: RoomMemberRole.OWNER
      })
    );

    return this.findOne(room.id, actor);
  }

  async list(query: ListRoomsQueryDto, actor: AuthUser) {
    const qb = this.roomsRepository
      .createQueryBuilder('room')
      .innerJoin('room.members', 'member', 'member.user_id = :userId', { userId: actor.sub })
      .where('room.company_id = :companyId', { companyId: actor.companyId })
      .orderBy('room.created_at', 'DESC');

    if (query.type) {
      qb.andWhere('room.type = :type', { type: query.type });
    }

    const rooms = await qb.getMany();
    return { success: true, data: rooms, error: null, meta: null };
  }

  async findOne(roomId: string, actor: AuthUser) {
    await this.ensureMembership(roomId, actor);
    const room = await this.roomsRepository.findOne({
      where: { id: roomId, companyId: actor.companyId },
      relations: { members: true }
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return { success: true, data: room, error: null, meta: null };
  }

  async join(roomId: string, actor: AuthUser) {
    const room = await this.roomsRepository.findOne({
      where: { id: roomId, companyId: actor.companyId }
    });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const existing = await this.roomMembersRepository.findOne({
      where: { roomId, userId: actor.sub }
    });
    if (existing) {
      return { success: true, data: existing, error: null, meta: null };
    }

    const membership = await this.roomMembersRepository.save(
      this.roomMembersRepository.create({
        roomId,
        userId: actor.sub,
        role: RoomMemberRole.MEMBER
      })
    );

    return { success: true, data: membership, error: null, meta: null };
  }

  async leave(roomId: string, actor: AuthUser) {
    const membership = await this.roomMembersRepository.findOne({
      where: { roomId, userId: actor.sub }
    });
    if (!membership) {
      throw new NotFoundException('Room membership not found');
    }

    await this.roomMembersRepository.remove(membership);
    return { success: true, data: { roomId, userId: actor.sub }, error: null, meta: null };
  }

  async addMember(roomId: string, dto: AddRoomMemberDto, actor: AuthUser) {
    await this.ensureManagePermission(roomId, actor);

    const user = await this.usersRepository.findOne({
      where: { id: dto.userId, companyId: actor.companyId, isActive: true }
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.roomMembersRepository.findOne({
      where: { roomId, userId: dto.userId }
    });
    if (existing) {
      throw new ConflictException('User is already a room member');
    }

    const membership = await this.roomMembersRepository.save(
      this.roomMembersRepository.create({
        roomId,
        userId: dto.userId,
        role: RoomMemberRole.MEMBER
      })
    );

    return { success: true, data: membership, error: null, meta: null };
  }

  async removeMember(roomId: string, userId: string, actor: AuthUser) {
    await this.ensureManagePermission(roomId, actor);

    const membership = await this.roomMembersRepository.findOne({
      where: { roomId, userId }
    });
    if (!membership) {
      throw new NotFoundException('Room membership not found');
    }

    await this.roomMembersRepository.remove(membership);
    return { success: true, data: { roomId, userId }, error: null, meta: null };
  }

  async ensureMembership(roomId: string, actor: AuthUser) {
    const membership = await this.roomMembersRepository.findOne({
      where: { roomId, userId: actor.sub },
      relations: { room: true }
    });

    if (!membership || membership.room.companyId !== actor.companyId) {
      throw new ForbiddenException('You are not a member of this room');
    }

    return membership;
  }

  private async ensureManagePermission(roomId: string, actor: AuthUser) {
    if (actor.role === UserRole.COMPANY_ADMIN || actor.role === UserRole.MASTER_ADMIN) {
      return;
    }

    const membership = await this.roomMembersRepository.findOne({
      where: { roomId, userId: actor.sub }
    });

    if (!membership || ![RoomMemberRole.OWNER, RoomMemberRole.MODERATOR].includes(membership.role)) {
      throw new ForbiddenException('You do not have permission to manage this room');
    }
  }
}
