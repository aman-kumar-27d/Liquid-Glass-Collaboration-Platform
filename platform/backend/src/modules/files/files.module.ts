import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageService } from '../../shared/storage/storage.service';
import { AnalyticsModule } from '../analytics/analytics.module';
import { Message } from '../messages/message.entity';
import { RoomsModule } from '../rooms/rooms.module';
import { StoredFile } from './file.entity';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([StoredFile, Message]), RoomsModule, AnalyticsModule],
  controllers: [FilesController],
  providers: [FilesService, StorageService],
  exports: [FilesService]
})
export class FilesModule {}
