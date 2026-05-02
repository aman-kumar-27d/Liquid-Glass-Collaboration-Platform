import { IsDateString, IsOptional } from 'class-validator';

export class UsageSummaryQueryDto {
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
