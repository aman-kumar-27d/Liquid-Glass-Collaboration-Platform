import {
  BeforeInsert,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm';
import { randomUUID } from 'node:crypto';

export abstract class BaseEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;

  @BeforeInsert()
  assignId() {
    this.id = this.id ?? randomUUID();
  }
}
