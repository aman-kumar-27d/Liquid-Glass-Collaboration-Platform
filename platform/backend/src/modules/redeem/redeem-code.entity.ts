import { Column, Entity, Index } from 'typeorm';
import { SubscriptionPlan } from '../../common/enums/subscription-plan.enum';
import { BaseEntity } from '../../database/entities/base.entity';

@Entity({ name: 'redeem_codes' })
export class RedeemCode extends BaseEntity {
  @Index({ unique: true })
  @Column({ length: 64 })
  code!: string;

  @Column({ type: 'simple-enum', enum: SubscriptionPlan })
  plan!: SubscriptionPlan;

  @Column({ name: 'expiry_at', type: 'datetime', nullable: true })
  expiryAt?: Date | null;

  @Column({ name: 'usage_limit', type: 'int', nullable: true })
  usageLimit?: number | null;

  @Column({ name: 'used_count', type: 'int', default: 0 })
  usedCount!: number;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;
}
