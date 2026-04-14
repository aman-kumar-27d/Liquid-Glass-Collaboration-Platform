import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JoinCallDto, StartCallDto } from './video.dto';
import { VideoService } from './video.service';

@Controller('calls')
@UseGuards(JwtAuthGuard)
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('start')
  startCall(@Body() dto: StartCallDto, @CurrentUser() user: any) {
    return this.videoService.startCall(dto, user);
  }

  @Post('join')
  joinCall(@Body() dto: JoinCallDto, @CurrentUser() user: any) {
    return this.videoService.joinCall(dto, user);
  }

  @Post(':id/leave')
  leaveCall(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: any) {
    return this.videoService.leaveCall(id, user);
  }

  @Post(':id/end')
  endCall(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: any) {
    return this.videoService.endCall(id, user);
  }

  @Get('rooms/:roomId/active')
  getActiveRoomCall(
    @Param('roomId', new ParseUUIDPipe()) roomId: string,
    @CurrentUser() user: any
  ) {
    return this.videoService.getActiveRoomCall(roomId, user);
  }
}
