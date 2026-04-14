import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get('liveness')
  getLiveness() {
    return {
      success: true,
      data: { status: 'ok' },
      error: null,
      meta: { service: 'api' }
    };
  }

  @Get('readiness')
  getReadiness() {
    return {
      success: true,
      data: { status: 'ready' },
      error: null,
      meta: { service: 'api' }
    };
  }
}
