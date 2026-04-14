import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany
} from 'typeorm';
import { MessageType } from '../../common/enums/message-type.enum';
import { BaseEntity } from '../../database/entities/base.entity';
import { Room } from '../rooms/room.entity';
import { User } from '../users/user.entity';
import { MessageReaction } from './message-reaction.entity';

@Entity({ name: 'messages' })
@Index(['roomId', 'createdAt'])
export class Message extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @Column({ name: 'room_id', type: 'uuid' })
  roomId!: string;

  @ManyToOne(() => Room)
  @JoinColumn({ name: 'room_id' })
  room!: Room;

  @Column({ name: 'sender_id', type: 'uuid' })
  senderId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender!: User;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'simple-enum', enum: MessageType, default: MessageType.TEXT })
  type!: MessageType;

  @Column({ name: 'parent_message_id', type: 'uuid', nullable: true })
  parentMessageId?: string | null;

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'parent_message_id' })
  parentMessage?: Message | null;

  @Column({ name: 'edited_at', type: 'datetime', nullable: true })
  editedAt?: Date | null;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, unknown> | null;

  @OneToMany(() => MessageReaction, (reaction) => reaction.message)
  reactions!: MessageReaction[];
}
