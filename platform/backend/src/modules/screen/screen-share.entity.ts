import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';
import { User } from '../users/user.entity';
import { VideoCall } from '../video/video-call.entity';

@Entity({ name: 'screen_shares' })
@Index(['callId', 'userId'])
export class ScreenShare extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @Column({ name: 'call_id', type: 'uuid' })
  callId!: string;

  @ManyToOne(() => VideoCall)
  @JoinColumn({ name: 'call_id' })
  call!: VideoCall;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'started_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  startedAt!: Date;

  @Column({ name: 'ended_at', type: 'datetime', nullable: true })
  endedAt?: Date | null;
}
