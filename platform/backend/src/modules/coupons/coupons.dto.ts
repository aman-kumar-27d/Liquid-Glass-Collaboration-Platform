import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  @Length(3, 64)
  code!: string;

  @IsInt()
  @Min(1)
  @Max(100)
  discountPercent!: number;

  @IsOptional()
  expiryAt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;
}
