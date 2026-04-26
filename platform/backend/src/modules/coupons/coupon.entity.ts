import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';

@Entity({ name: 'coupons' })
export class Coupon extends BaseEntity {
  @Index({ unique: true })
  @Column({ length: 64 })
  code!: string;

  @Column({ name: 'discount_percent', type: 'int' })
  discountPercent!: number;

  @Column({ name: 'expiry_at', type: 'datetime', nullable: true })
  expiryAt?: Date | null;

  @Column({ name: 'usage_limit', type: 'int', nullable: true })
  usageLimit?: number | null;

  @Column({ name: 'used_count', type: 'int', default: 0 })
  usedCount!: number;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;
}
