import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../src/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.WEBSOCKET_PORT ? Number(process.env.WEBSOCKET_PORT) : 4001;
  await app.listen(port);

  Logger.log(`Websocket shell listening on port ${port}`, 'Bootstrap');
}

bootstrap();
