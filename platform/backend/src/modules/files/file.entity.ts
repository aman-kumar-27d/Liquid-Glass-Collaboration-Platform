import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';
import { Message } from '../messages/message.entity';
import { Room } from '../rooms/room.entity';
import { User } from '../users/user.entity';

@Entity({ name: 'files' })
@Index(['messageId'])
export class StoredFile extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @Column({ name: 'room_id', type: 'uuid' })
  roomId!: string;

  @ManyToOne(() => Room)
  @JoinColumn({ name: 'room_id' })
  room!: Room;

  @Column({ name: 'message_id', type: 'uuid', nullable: true })
  messageId?: string | null;

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'message_id' })
  message?: Message | null;

  @Column({ name: 'uploaded_by', type: 'uuid' })
  uploadedBy!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploader!: User;

  @Column({ name: 'original_name', length: 255 })
  originalName!: string;

  @Column({ name: 'stored_name', length: 255 })
  storedName!: string;

  @Column({ name: 'mime_type', length: 160 })
  mimeType!: string;

  @Column({ type: 'bigint' })
  size!: number;

  @Column({ name: 'storage_driver', length: 32, default: 'local' })
  storageDriver!: string;

  @Column({ name: 'storage_path', length: 500 })
  storagePath!: string;
}
