import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../companies/company.entity';
import { Coupon } from '../coupons/coupon.entity';
import { RedeemCode } from '../redeem/redeem-code.entity';
import { Subscription } from '../subscription/subscription.entity';
import { MasterController } from './master.controller';
import { MasterService } from './master.service';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Subscription, Coupon, RedeemCode])],
  controllers: [MasterController],
  providers: [MasterService]
})
export class MasterModule {}
