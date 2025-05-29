import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { LoggerService } from './logger/logger.service';
import { AllExceptionsFilter } from './all-exceptions.filter';

// Constants
const allowedOrigins = ['http://localhost:3000'];

async function bootstrap() {
  // Initialize NestJS application
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);
  const { httpAdapter } = app.get(HttpAdapterHost);
  const logger = app.get(LoggerService);

  // Global middleware
  app.use(cookieParser(configService.get<string>('COOKIE_SECRET')));

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  // Global services
  app.useLogger(logger);

  // CORS configuration
  app.enableCors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Start server
  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on port ${port}`, 'Bootstrap');
}

bootstrap();
