import { Controller, Get, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheck } from '@nestjs/terminus';
import { Request } from 'express';
import { LoggerService } from '@/core/logger/logger.service';
import { HealthService } from '@/modules/health/health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly logger = new LoggerService(HealthController.name);

  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check application health' })
  @ApiResponse({ status: 200, description: 'Health check passed' })
  @ApiResponse({ status: 503, description: 'Health check failed' })
  async check(@Req() req: Request) {
    this.logger.log('Health check requested', 'HealthController', {
      endpoint: '/health',
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.socket.remoteAddress,
    });

    const result = await this.healthService.checkAll();

    this.logger.log('Health check completed', 'HealthController', {
      endpoint: '/health',
      status: result.status,
    });

    return result;
  }

  @Get('liveness')
  @ApiOperation({ summary: 'Liveness probe - check if service is alive' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  liveness() {
    return this.healthService.checkLiveness();
  }

  @Get('readiness')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe - check if service is ready' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  readiness() {
    return this.healthService.checkReadiness();
  }

  @Get('database')
  @ApiOperation({ summary: 'Check database connectivity only' })
  @ApiResponse({ status: 200, description: 'Database is healthy' })
  database() {
    return this.healthService.checkDatabase();
  }
}
