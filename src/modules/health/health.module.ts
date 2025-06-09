import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from '@/modules/health/health.controller';
import { HealthService } from '@/modules/health/health.service';
import { DatabaseModule } from '@/core/database/database.module';
import { LoggerModule } from '@/core/logger/logger.module';

@Module({
  imports: [TerminusModule, DatabaseModule, LoggerModule],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
