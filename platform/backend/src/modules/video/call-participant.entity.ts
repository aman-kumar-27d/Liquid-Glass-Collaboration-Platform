import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';
import { User } from '../users/user.entity';
import { VideoCall } from './video-call.entity';

@Entity({ name: 'call_participants' })
@Index(['callId', 'userId'], { unique: true })
export class CallParticipant extends BaseEntity {
  @Column({ name: 'call_id', type: 'uuid' })
  callId!: string;

  @ManyToOne(() => VideoCall, (call) => call.participants)
  @JoinColumn({ name: 'call_id' })
  call!: VideoCall;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'joined_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt!: Date;

  @Column({ name: 'left_at', type: 'datetime', nullable: true })
  leftAt?: Date | null;
}
