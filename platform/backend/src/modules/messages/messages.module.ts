import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsModule } from '../analytics/analytics.module';
import { StoredFile } from '../files/file.entity';
import { RoomsModule } from '../rooms/rooms.module';
import { ScreenModule } from '../screen/screen.module';
import { VideoModule } from '../video/video.module';
import { MessageReaction } from './message-reaction.entity';
import { Message } from './message.entity';
import { MessagesController } from './messages.controller';
import { MessagesGateway } from './messages.gateway';
import { MessagesService } from './messages.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, MessageReaction, StoredFile]),
    RoomsModule,
    AnalyticsModule,
    JwtModule,
    VideoModule,
    ScreenModule
  ],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway],
  exports: [MessagesService, MessagesGateway]
})
export class MessagesModule {}
