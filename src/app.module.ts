import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { EmployeesModule } from './employees/employees.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from './logger/logger.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { securityConfig } from './common/config/security.config';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    EmployeesModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => {
        const security = securityConfig();
        return {
          throttlers: [
            {
              name: 'short',
              ttl: security.rateLimiting.short.ttl,
              limit: security.rateLimiting.short.limit,
            },
            {
              name: 'medium',
              ttl: security.rateLimiting.medium.ttl,
              limit: security.rateLimiting.medium.limit,
            },
            {
              name: 'long',
              ttl: security.rateLimiting.long.ttl,
              limit: security.rateLimiting.long.limit,
            },
            {
              name: 'auth',
              ttl: security.rateLimiting.auth.ttl,
              limit: security.rateLimiting.auth.limit,
            },
          ],
        };
      },
    }),
    LoggerModule,
    AuthModule,
    UsersModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
