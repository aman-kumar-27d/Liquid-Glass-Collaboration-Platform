import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageService } from '../../shared/storage/storage.service';
import { Session } from '../auth/session.entity';
import { Company } from '../companies/company.entity';
import { Coupon } from '../coupons/coupon.entity';
import { StoredFile } from '../files/file.entity';
import { RedeemCode } from '../redeem/redeem-code.entity';
import { AnalyticsService } from './analytics.service';

@Injectable()
export class AnalyticsJobsService {
  constructor(
    private readonly analyticsService: AnalyticsService,
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
    @InjectRepository(Coupon)
    private readonly couponsRepository: Repository<Coupon>,
    @InjectRepository(RedeemCode)
    private readonly redeemCodesRepository: Repository<RedeemCode>,
    @InjectRepository(StoredFile)
    private readonly filesRepository: Repository<StoredFile>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    private readonly storageService: StorageService
  ) {}

  async runDailyAggregation(date = new Date()) {
    const target = new Date(date);
    target.setDate(target.getDate() - 1);
    target.setHours(0, 0, 0, 0);

    const companies = await this.companiesRepository.find({
      select: {
        id: true
      }
    });

    for (const company of companies) {
      await this.analyticsService.aggregateDailySnapshots(target, company.id);
    }

    await this.analyticsService.aggregateDailySnapshots(target, null);

    return {
      success: true,
      data: {
        snapshotDate: target.toISOString().slice(0, 10),
        companiesProcessed: companies.length
      },
      error: null,
      meta: null
    };
  }

  async runCleanupJobs() {
    const now = new Date();
    const sessionCutoff = new Date(now);
    sessionCutoff.setDate(sessionCutoff.getDate() - 7);

    const staleUploadCutoff = new Date(now);
    staleUploadCutoff.setDate(staleUploadCutoff.getDate() - 1);

    const expiredSessions = await this.sessionsRepository.find({
      where: [],
      withDeleted: true
    });
    const removableSessions = expiredSessions.filter(
      (session) =>
        (session.revokedAt && session.revokedAt < sessionCutoff) || session.expiresAt < sessionCutoff
    );
    if (removableSessions.length) {
      await this.sessionsRepository.remove(removableSessions);
    }

    const staleFiles = await this.filesRepository.find({
      where: {
        messageId: null as any
      }
    });
    const removableFiles = staleFiles.filter((file) => file.createdAt < staleUploadCutoff);
    for (const file of removableFiles) {
      await this.storageService.deleteObject(file.storagePath).catch(() => undefined);
    }
    if (removableFiles.length) {
      await this.filesRepository.remove(removableFiles);
    }

    const coupons = await this.couponsRepository.find();
    const expiredCoupons = coupons.filter((coupon) => coupon.isActive && coupon.expiryAt && coupon.expiryAt < now);
    for (const coupon of expiredCoupons) {
      coupon.isActive = false;
    }
    if (expiredCoupons.length) {
      await this.couponsRepository.save(expiredCoupons);
    }

    const redeemCodes = await this.redeemCodesRepository.find();
    const expiredRedeemCodes = redeemCodes.filter(
      (redeemCode) => redeemCode.isActive && redeemCode.expiryAt && redeemCode.expiryAt < now
    );
    for (const redeemCode of expiredRedeemCodes) {
      redeemCode.isActive = false;
    }
    if (expiredRedeemCodes.length) {
      await this.redeemCodesRepository.save(expiredRedeemCodes);
    }

    return {
      success: true,
      data: {
        removedSessions: removableSessions.length,
        removedStagedFiles: removableFiles.length,
        deactivatedCoupons: expiredCoupons.length,
        deactivatedRedeemCodes: expiredRedeemCodes.length
      },
      error: null,
      meta: null
    };
  }
}
