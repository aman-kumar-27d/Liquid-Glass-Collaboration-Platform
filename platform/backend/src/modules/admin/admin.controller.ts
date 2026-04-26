import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UpdateAdminUserDto } from './admin.dto';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COMPANY_ADMIN, UserRole.MASTER_ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  listUsers(@CurrentUser() user: any) {
    return this.adminService.listUsers(user);
  }

  @Patch('users/:id')
  updateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateAdminUserDto,
    @CurrentUser() user: any
  ) {
    return this.adminService.updateUser(id, dto, user);
  }

  @Get('rooms')
  listRooms(@CurrentUser() user: any) {
    return this.adminService.listRooms(user);
  }

  @Delete('rooms/:id')
  archiveRoom(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: any) {
    return this.adminService.archiveRoom(id, user);
  }
}
