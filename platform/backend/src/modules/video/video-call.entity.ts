import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';
import { Room } from '../rooms/room.entity';
import { User } from '../users/user.entity';
import { CallParticipant } from './call-participant.entity';

@Entity({ name: 'video_calls' })
@Index(['roomId', 'createdAt'])
export class VideoCall extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @Column({ name: 'room_id', type: 'uuid' })
  roomId!: string;

  @ManyToOne(() => Room)
  @JoinColumn({ name: 'room_id' })
  room!: Room;

  @Column({ name: 'started_by', type: 'uuid' })
  startedBy!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'started_by' })
  starter!: User;

  @Column({ name: 'ended_at', type: 'datetime', nullable: true })
  endedAt?: Date | null;

  @OneToMany(() => CallParticipant, (participant) => participant.call)
  participants!: CallParticipant[];
}
