import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsModule } from '../rooms/rooms.module';
import { CallParticipant } from './call-participant.entity';
import { VideoController } from './video.controller';
import { VideoCall } from './video-call.entity';
import { VideoService } from './video.service';

@Module({
  imports: [TypeOrmModule.forFeature([VideoCall, CallParticipant]), RoomsModule],
  controllers: [VideoController],
  providers: [VideoService],
  exports: [VideoService, TypeOrmModule]
})
export class VideoModule {}
