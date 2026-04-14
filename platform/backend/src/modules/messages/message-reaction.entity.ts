import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';
import { User } from '../users/user.entity';
import { Message } from './message.entity';

@Entity({ name: 'message_reactions' })
@Index(['messageId', 'userId', 'emoji'], { unique: true })
export class MessageReaction extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @Column({ name: 'message_id', type: 'uuid' })
  messageId!: string;

  @ManyToOne(() => Message, (message) => message.reactions)
  @JoinColumn({ name: 'message_id' })
  message!: Message;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ length: 32 })
  emoji!: string;
}
