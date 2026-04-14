import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StartScreenShareDto } from './screen.dto';
import { ScreenService } from './screen.service';

@Controller('screen-share')
@UseGuards(JwtAuthGuard)
export class ScreenController {
  constructor(private readonly screenService: ScreenService) {}

  @Post('start')
  start(@Body() dto: StartScreenShareDto, @CurrentUser() user: any) {
    return this.screenService.startShare(dto, user);
  }

  @Post(':callId/stop')
  stop(@Param('callId', new ParseUUIDPipe()) callId: string, @CurrentUser() user: any) {
    return this.screenService.stopShare(callId, user);
  }
}
