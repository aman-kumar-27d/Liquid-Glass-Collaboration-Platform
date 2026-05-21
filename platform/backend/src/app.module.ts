import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import storageConfig from './config/storage.config';
import { TenantContextMiddleware } from './common/middleware/tenant-context.middleware';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { MessagesModule } from './modules/messages/messages.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { ScreenModule } from './modules/screen/screen.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { UsersModule } from './modules/users/users.module';
import { VideoModule } from './modules/video/video.module';
import { FilesModule } from './modules/files/files.module';
import { AdminModule } from './modules/admin/admin.module';
import { MasterModule } from './modules/master/master.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
      load: [appConfig, databaseConfig, jwtConfig, redisConfig, storageConfig]
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...createDatabaseOptions(),
        autoLoadEntities: true
      })
    }),
    HealthModule,
    AuthModule,
    CompaniesModule,
    UsersModule,
    RoomsModule,
    MessagesModule,
    FilesModule,
    VideoModule,
    ScreenModule,
    SubscriptionModule,
    AdminModule,
    MasterModule,
    AnalyticsModule
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantContextMiddleware).forRoutes('*');
  }
}

function createDatabaseOptions() {
  const databaseType = process.env.DATABASE_TYPE ?? 'postgres';

  if (databaseType === 'sqljs') {
    const location = path.resolve(
      process.cwd(),
      process.env.DATABASE_SQLJS_LOCATION ?? './.data/dev.sqlite'
    );
    const dataDirectory = path.dirname(location);

    if (!existsSync(dataDirectory)) {
      mkdirSync(dataDirectory, { recursive: true });
    }

    return {
      type: 'sqljs' as const,
      location,
      autoSave: true,
      synchronize: true
    };
  }

  return {
    type: 'postgres' as const,
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT ?? 5432),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize: false
  };
}
