import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from '../auth/session.entity';
import { Company } from '../companies/company.entity';
import { Coupon } from '../coupons/coupon.entity';
import { StoredFile } from '../files/file.entity';
import { Message } from '../messages/message.entity';
import { RedeemCode } from '../redeem/redeem-code.entity';
import { Room } from '../rooms/room.entity';
import { Subscription } from '../subscription/subscription.entity';
import { User } from '../users/user.entity';
import { VideoCall } from '../video/video-call.entity';
import { StorageService } from '../../shared/storage/storage.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsDailySnapshot } from './analytics-daily-snapshot.entity';
import { AnalyticsJobsService } from './analytics-jobs.service';
import { AnalyticsService } from './analytics.service';
import { UsageEvent } from './usage-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsageEvent,
      AnalyticsDailySnapshot,
      User,
      Room,
      Message,
      StoredFile,
      VideoCall,
      Company,
      Subscription,
      Session,
      Coupon,
      RedeemCode
    ])
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsJobsService, StorageService],
  exports: [AnalyticsService, AnalyticsJobsService]
})
export class AnalyticsModule {}
