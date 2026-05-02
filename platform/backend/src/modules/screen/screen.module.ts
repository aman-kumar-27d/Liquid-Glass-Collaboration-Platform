import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsModule } from '../analytics/analytics.module';
import { RoomsModule } from '../rooms/rooms.module';
import { VideoCall } from '../video/video-call.entity';
import { ScreenController } from './screen.controller';
import { ScreenShare } from './screen-share.entity';
import { ScreenService } from './screen.service';

@Module({
  imports: [TypeOrmModule.forFeature([ScreenShare, VideoCall]), RoomsModule, AnalyticsModule],
  controllers: [ScreenController],
  providers: [ScreenService],
  exports: [ScreenService, TypeOrmModule]
})
export class ScreenModule {}
