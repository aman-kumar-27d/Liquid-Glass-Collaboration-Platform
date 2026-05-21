import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AnalyticsService } from './analytics.service';
import { UsageSummaryQueryDto } from './analytics.dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER, UserRole.MODERATOR, UserRole.COMPANY_ADMIN, UserRole.MASTER_ADMIN)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser() user: any) {
    return this.analyticsService.getTenantDashboard(user);
  }

  @Get('usage-summary')
  getUsageSummary(@CurrentUser() user: any, @Query() query: UsageSummaryQueryDto) {
    return this.analyticsService.getUsageSummary(user, query);
  }

  @Get('usage-comparison')
  getUsageComparison(@CurrentUser() user: any, @Query() query: UsageSummaryQueryDto) {
    return this.analyticsService.getUsageComparison(user, query);
  }
}
