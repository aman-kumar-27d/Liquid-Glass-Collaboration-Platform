import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApplyCouponDto, ChangePlanDto, RedeemCodeDto } from './subscription.dto';
import { SubscriptionService } from './subscription.service';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plans')
  getPlans() {
    return this.subscriptionService.getPlans();
  }

  @Get('current')
  getCurrent(@CurrentUser() user: any) {
    return this.subscriptionService.getCurrentSubscription(user);
  }

  @Post('change-plan')
  changePlan(@Body() dto: ChangePlanDto, @CurrentUser() user: any) {
    return this.subscriptionService.changePlan(dto, user);
  }

  @Post('apply-coupon')
  applyCoupon(@Body() dto: ApplyCouponDto, @CurrentUser() user: any) {
    return this.subscriptionService.applyCoupon(dto, user);
  }

  @Post('redeem-code')
  redeemCode(@Body() dto: RedeemCodeDto, @CurrentUser() user: any) {
    return this.subscriptionService.redeemCode(dto, user);
  }
}
