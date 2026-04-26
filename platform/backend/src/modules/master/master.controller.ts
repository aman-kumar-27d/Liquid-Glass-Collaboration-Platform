import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateCouponDto } from '../coupons/coupons.dto';
import { CreateRedeemCodeDto } from '../redeem/redeem.dto';
import { MasterService } from './master.service';

@Controller('master')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MASTER_ADMIN)
export class MasterController {
  constructor(private readonly masterService: MasterService) {}

  @Get('companies')
  listCompanies() {
    return this.masterService.listCompanies();
  }

  @Get('subscriptions')
  listSubscriptions() {
    return this.masterService.listSubscriptions();
  }

  @Get('coupons')
  listCoupons() {
    return this.masterService.listCoupons();
  }

  @Post('coupons')
  createCoupon(@Body() dto: CreateCouponDto) {
    return this.masterService.createCoupon(dto);
  }

  @Get('redeem-codes')
  listRedeemCodes() {
    return this.masterService.listRedeemCodes();
  }

  @Post('redeem-codes')
  createRedeemCode(@Body() dto: CreateRedeemCodeDto) {
    return this.masterService.createRedeemCode(dto);
  }
}
