/**
 * Health Check Controller
 * Provides endpoints for monitoring service health
 */

import { Controller, Get } from '@nestjs/common';

interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  service: string;
  version: string;
}

@Controller('health')
export class HealthController {
  @Get()
  check(): HealthCheckResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'api-gateway',
      version: '1.0.0',
    };
  }

  @Get('readiness')
  readiness(): { ready: boolean } {
    // Check if all dependencies are ready
    // In a real implementation, check database, cache, queue connections
    return { ready: true };
  }

  @Get('liveness')
  liveness(): { alive: boolean } {
    return { alive: true };
  }
}
