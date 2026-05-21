import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UsageSummaryQueryDto {
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  eventType?: string;
}
