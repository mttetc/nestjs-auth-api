import { Injectable } from '@nestjs/common';
import {
  HealthCheckService,
  HealthIndicatorResult,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { DatabaseService } from '@/core/database/database.service';
import { LoggerService } from '@/core/logger/logger.service';

@Injectable()
export class HealthService {
  private readonly logger = new LoggerService(HealthService.name);

  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly databaseService: DatabaseService,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
  ) {}

  /**
   * Check database connectivity
   */
  async checkDatabase(): Promise<HealthIndicatorResult> {
    try {
      await this.databaseService.$queryRaw`SELECT 1`;
      this.logger.log('Database health check passed', 'HealthService', {
        check: 'database',
        status: 'up',
      });
      return { database: { status: 'up' } };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        'Database health check failed',
        error instanceof Error ? error.stack : undefined,
        'HealthService',
        {
          check: 'database',
          status: 'down',
          error: errorMessage,
        },
      );
      return { database: { status: 'down', error: errorMessage } };
    }
  }

  /**
   * Check memory usage
   */
  async checkMemory(): Promise<HealthIndicatorResult> {
    try {
      const heapCheck = await this.memory.checkHeap(
        'memory_heap',
        300 * 1024 * 1024,
      );
      const rssCheck = await this.memory.checkRSS(
        'memory_rss',
        300 * 1024 * 1024,
      );

      this.logger.log('Memory health check passed');
      return { ...heapCheck, ...rssCheck };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Memory health check failed', errorMessage);
      throw error;
    }
  }

  /**
   * Check disk storage
   */
  async checkStorage(): Promise<HealthIndicatorResult> {
    try {
      const storageCheck = await this.disk.checkStorage('storage', {
        thresholdPercent: 0.9,
        path: '/',
      });

      this.logger.log('Storage health check passed');
      return storageCheck;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Storage health check failed', errorMessage);
      throw error;
    }
  }

  /**
   * Run comprehensive health check
   */
  async checkAll() {
    return this.healthCheckService.check([
      () => this.checkDatabase(),
      () => this.checkMemory(),
      () => this.checkStorage(),
    ]);
  }

  /**
   * Quick liveness probe - just check if service is running
   */
  checkLiveness(): HealthIndicatorResult {
    return {
      service: {
        status: 'up',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    };
  }

  /**
   * Readiness probe - check if service is ready to handle requests
   */
  async checkReadiness() {
    return this.healthCheckService.check([() => this.checkDatabase()]);
  }
}
