import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { RoomMemberRole } from '../../common/enums/room-member-role.enum';
import { BaseEntity } from '../../database/entities/base.entity';
import { User } from '../users/user.entity';
import { Room } from './room.entity';

@Entity({ name: 'room_members' })
@Index(['roomId', 'userId'], { unique: true })
export class RoomMember extends BaseEntity {
  @Column({ name: 'room_id', type: 'uuid' })
  roomId!: string;

  @ManyToOne(() => Room, (room) => room.members)
  @JoinColumn({ name: 'room_id' })
  room!: Room;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'simple-enum', enum: RoomMemberRole, default: RoomMemberRole.MEMBER })
  role!: RoomMemberRole;

  @Column({ name: 'joined_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt!: Date;
}
