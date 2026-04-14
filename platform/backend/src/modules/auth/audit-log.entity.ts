import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';

@Entity({ name: 'audit_logs' })
@Index(['companyId', 'createdAt'])
export class AuditLog extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId?: string | null;

  @Column({ name: 'actor_user_id', type: 'uuid', nullable: true })
  actorUserId?: string | null;

  @Column({ length: 120 })
  action!: string;

  @Column({ length: 120 })
  resource!: string;

  @Column({ name: 'resource_id', type: 'varchar', length: 120, nullable: true })
  resourceId?: string | null;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, unknown> | null;
}
