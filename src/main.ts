import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { RequestHandler } from 'express';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { LoggerService } from './modules/logger/logger.service';
import { AllExceptionsFilter } from './shared/all-exceptions.filter';
import { SecurityHeadersMiddleware } from './shared/middleware/security-headers.middleware';
import { securityConfig } from './shared/config/security.config';

async function bootstrap() {
  // Initialize NestJS application
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);
  const { httpAdapter } = app.get(HttpAdapterHost);
  const logger = app.get(LoggerService);

  // Security configuration
  const security = securityConfig();

  // Global middleware
  app.use(cookieParser(configService.get<string>('COOKIE_SECRET')));

  // Security headers middleware
  const securityMiddleware = new SecurityHeadersMiddleware();
  app.use(securityMiddleware.use.bind(securityMiddleware) as RequestHandler);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  // Global services
  app.useLogger(logger);

  // CORS configuration
  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      if (!origin || security.cors.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: security.cors.credentials,
  };

  app.enableCors(corsOptions);

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('NestJS REST API')
    .setDescription(
      'A comprehensive REST API built with NestJS, featuring authentication, rate limiting, and more',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3000', 'Development server')
    .addServer('https://api.yourdomain.com', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Start server
  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on port ${port}`, 'Bootstrap');
  logger.log(
    `Swagger documentation available at http://localhost:${port}/docs`,
    'Bootstrap',
  );
}

bootstrap();
