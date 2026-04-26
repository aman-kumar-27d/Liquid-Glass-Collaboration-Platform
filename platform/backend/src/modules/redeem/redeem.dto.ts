import { IsEnum, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';
import { SubscriptionPlan } from '../../common/enums/subscription-plan.enum';

export class CreateRedeemCodeDto {
  @IsString()
  @Length(3, 64)
  code!: string;

  @IsEnum(SubscriptionPlan)
  plan!: SubscriptionPlan;

  @IsOptional()
  expiryAt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;
}
