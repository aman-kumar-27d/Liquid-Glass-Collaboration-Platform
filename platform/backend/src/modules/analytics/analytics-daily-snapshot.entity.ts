import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';

@Entity({ name: 'analytics_daily_snapshots' })
@Index(['scope', 'snapshotDate', 'companyId'], { unique: true })
export class AnalyticsDailySnapshot extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId?: string | null;

  @Column({ length: 32 })
  scope!: string;

  @Column({ name: 'snapshot_date', type: 'date' })
  snapshotDate!: string;

  @Column({ type: 'simple-json' })
  summary!: Record<string, unknown>;
}
