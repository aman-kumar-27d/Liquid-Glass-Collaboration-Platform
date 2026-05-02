import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsService } from '../analytics/analytics.service';
import { Company } from '../companies/company.entity';
import { Coupon } from '../coupons/coupon.entity';
import { CreateCouponDto } from '../coupons/coupons.dto';
import { RedeemCode } from '../redeem/redeem-code.entity';
import { CreateRedeemCodeDto } from '../redeem/redeem.dto';
import { Subscription } from '../subscription/subscription.entity';

@Injectable()
export class MasterService {
  constructor(
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(Subscription)
    private readonly subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(Coupon)
    private readonly couponsRepository: Repository<Coupon>,
    @InjectRepository(RedeemCode)
    private readonly redeemCodesRepository: Repository<RedeemCode>,
    private readonly analyticsService: AnalyticsService
  ) {}

  async listCompanies() {
    const companies = await this.companiesRepository.find({ order: { createdAt: 'DESC' } });
    return { success: true, data: companies, error: null, meta: null };
  }

  async listSubscriptions() {
    const subscriptions = await this.subscriptionsRepository.find({
      order: { createdAt: 'DESC' }
    });
    return { success: true, data: subscriptions, error: null, meta: null };
  }

  async listCoupons() {
    const coupons = await this.couponsRepository.find({ order: { createdAt: 'DESC' } });
    return { success: true, data: coupons, error: null, meta: null };
  }

  async createCoupon(dto: CreateCouponDto) {
    const existing = await this.couponsRepository.findOne({ where: { code: dto.code.toUpperCase() } });
    if (existing) {
      throw new ConflictException('Coupon code already exists');
    }

    const coupon = await this.couponsRepository.save(
      this.couponsRepository.create({
        code: dto.code.toUpperCase(),
        discountPercent: dto.discountPercent,
        expiryAt: dto.expiryAt ? new Date(dto.expiryAt) : null,
        usageLimit: dto.usageLimit ?? null,
        isActive: true
      })
    );

    return { success: true, data: coupon, error: null, meta: null };
  }

  async listRedeemCodes() {
    const redeemCodes = await this.redeemCodesRepository.find({
      order: { createdAt: 'DESC' }
    });
    return { success: true, data: redeemCodes, error: null, meta: null };
  }

  async createRedeemCode(dto: CreateRedeemCodeDto) {
    const existing = await this.redeemCodesRepository.findOne({
      where: { code: dto.code.toUpperCase() }
    });
    if (existing) {
      throw new ConflictException('Redeem code already exists');
    }

    const redeemCode = await this.redeemCodesRepository.save(
      this.redeemCodesRepository.create({
        code: dto.code.toUpperCase(),
        plan: dto.plan,
        expiryAt: dto.expiryAt ? new Date(dto.expiryAt) : null,
        usageLimit: dto.usageLimit ?? null,
        isActive: true
      })
    );

    return { success: true, data: redeemCode, error: null, meta: null };
  }

  async getSystemStats() {
    return this.analyticsService.getPlatformStats();
  }
}
