import { Column, Entity, Index } from 'typeorm';
import { SubscriptionPlan } from '../../common/enums/subscription-plan.enum';
import { BaseEntity } from '../../database/entities/base.entity';

@Entity({ name: 'subscriptions' })
@Index(['companyId', 'createdAt'])
export class Subscription extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @Column({ type: 'simple-enum', enum: SubscriptionPlan, default: SubscriptionPlan.TRIAL })
  plan!: SubscriptionPlan;

  @Column({ name: 'start_date', type: 'datetime' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'datetime', nullable: true })
  endDate?: Date | null;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, unknown> | null;
}
