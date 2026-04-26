import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { SubscriptionPlan } from '../../common/enums/subscription-plan.enum';

export class ChangePlanDto {
  @IsEnum(SubscriptionPlan)
  plan!: SubscriptionPlan;
}

export class ApplyCouponDto {
  @IsString()
  @Length(3, 64)
  code!: string;
}

export class RedeemCodeDto {
  @IsString()
  @Length(3, 64)
  code!: string;
}
