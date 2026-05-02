import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../src/app.module';
import { AnalyticsJobsService } from '../../../src/modules/analytics/analytics-jobs.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const task = process.env.WORKER_TASK ?? 'analytics:all';
  Logger.log(`Worker context booted for task ${task}`, 'Bootstrap');

  const analyticsJobsService = app.get(AnalyticsJobsService);

  if (task === 'analytics:daily') {
    await analyticsJobsService.runDailyAggregation();
  } else if (task === 'analytics:cleanup') {
    await analyticsJobsService.runCleanupJobs();
  } else if (task === 'analytics:all') {
    await analyticsJobsService.runDailyAggregation();
    await analyticsJobsService.runCleanupJobs();
  }

  await app.close();
}

bootstrap();
