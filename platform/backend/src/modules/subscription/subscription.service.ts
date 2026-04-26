import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from '../../common/enums/subscription-plan.enum';
import { Company } from '../companies/company.entity';
import { Coupon } from '../coupons/coupon.entity';
import { RedeemCode } from '../redeem/redeem-code.entity';
import { ApplyCouponDto, ChangePlanDto, RedeemCodeDto } from './subscription.dto';
import { Subscription } from './subscription.entity';

interface AuthUser {
  sub: string;
  companyId: string;
  role: string;
}

const PLAN_CATALOG = [
  { plan: SubscriptionPlan.TRIAL, maxUsers: 10, maxStorageGb: 2 },
  { plan: SubscriptionPlan.FREE, maxUsers: 5, maxStorageGb: 1 },
  { plan: SubscriptionPlan.PRO, maxUsers: 100, maxStorageGb: 100 },
  { plan: SubscriptionPlan.ENTERPRISE, maxUsers: null, maxStorageGb: null }
];

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(Coupon)
    private readonly couponsRepository: Repository<Coupon>,
    @InjectRepository(RedeemCode)
    private readonly redeemCodesRepository: Repository<RedeemCode>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>
  ) {}

  getPlans() {
    return { success: true, data: PLAN_CATALOG, error: null, meta: null };
  }

  async getCurrentSubscription(actor: AuthUser) {
    const subscription = await this.findActiveSubscription(actor.companyId);
    return { success: true, data: subscription, error: null, meta: null };
  }

  async changePlan(dto: ChangePlanDto, actor: AuthUser) {
    const existing = await this.ensureSubscription(actor.companyId);
    existing.isActive = false;
    existing.endDate = new Date();
    await this.subscriptionsRepository.save(existing);

    const nextSubscription = await this.subscriptionsRepository.save(
      this.subscriptionsRepository.create({
        companyId: actor.companyId,
        plan: dto.plan,
        startDate: new Date(),
        endDate: null,
        isActive: true
      })
    );

    await this.syncCompanyPlan(actor.companyId, dto.plan);
    return { success: true, data: nextSubscription, error: null, meta: null };
  }

  async applyCoupon(dto: ApplyCouponDto, actor: AuthUser) {
    const coupon = await this.couponsRepository.findOne({
      where: { code: dto.code.toUpperCase(), isActive: true }
    });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    this.assertUsageAvailable(coupon.usageLimit ?? null, coupon.usedCount);
    this.assertNotExpired(coupon.expiryAt ?? null);

    coupon.usedCount += 1;
    await this.couponsRepository.save(coupon);

    const subscription = await this.ensureSubscription(actor.companyId);
    subscription.metadata = {
      ...(subscription.metadata ?? {}),
      coupon: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        appliedAt: new Date().toISOString()
      }
    };

    const saved = await this.subscriptionsRepository.save(subscription);
    return { success: true, data: saved, error: null, meta: null };
  }

  async redeemCode(dto: RedeemCodeDto, actor: AuthUser) {
    const redeemCode = await this.redeemCodesRepository.findOne({
      where: { code: dto.code.toUpperCase(), isActive: true }
    });
    if (!redeemCode) {
      throw new NotFoundException('Redeem code not found');
    }

    this.assertUsageAvailable(redeemCode.usageLimit ?? null, redeemCode.usedCount);
    this.assertNotExpired(redeemCode.expiryAt ?? null);

    redeemCode.usedCount += 1;
    await this.redeemCodesRepository.save(redeemCode);

    return this.changePlan({ plan: redeemCode.plan }, actor);
  }

  async ensureSubscription(companyId: string) {
    const existing = await this.findActiveSubscription(companyId);
    if (existing) {
      return existing;
    }

    return this.subscriptionsRepository.save(
      this.subscriptionsRepository.create({
        companyId,
        plan: SubscriptionPlan.TRIAL,
        startDate: new Date(),
        endDate: null,
        isActive: true
      })
    );
  }

  private async findActiveSubscription(companyId: string) {
    return this.subscriptionsRepository.findOne({
      where: { companyId, isActive: true },
      order: { createdAt: 'DESC' }
    });
  }

  private async syncCompanyPlan(companyId: string, plan: SubscriptionPlan) {
    const company = await this.companiesRepository.findOne({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    company.plan = plan;
    await this.companiesRepository.save(company);
  }

  private assertNotExpired(expiryAt: Date | null) {
    if (expiryAt && expiryAt.getTime() < Date.now()) {
      throw new BadRequestException('Code is expired');
    }
  }

  private assertUsageAvailable(usageLimit: number | null, usedCount: number) {
    if (usageLimit !== null && usedCount >= usageLimit) {
      throw new ConflictException('Code usage limit reached');
    }
  }
}
