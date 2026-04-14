import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';

@Entity({ name: 'sessions' })
@Index(['userId', 'refreshTokenHash'])
export class Session extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @Column({ name: 'refresh_token_hash', length: 255 })
  refreshTokenHash!: string;

  @Column({ name: 'user_agent', type: 'varchar', length: 255, nullable: true })
  userAgent?: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 64, nullable: true })
  ipAddress?: string | null;

  @Column({ name: 'expires_at', type: 'datetime' })
  expiresAt!: Date;

  @Column({ name: 'revoked_at', type: 'datetime', nullable: true })
  revokedAt?: Date | null;
}
