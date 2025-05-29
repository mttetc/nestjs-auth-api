import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from './logger/logger.service';
import { PrismaClientValidationError } from 'generated/prisma/runtime/library';
import { BaseExceptionFilter } from '@nestjs/core';

type ExceptionResponse = {
  statusCode: HttpStatus;
  timestamp: string;
  path: string;
  response: string | object;
};

@Catch(HttpException)
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new LoggerService(AllExceptionsFilter.name);

  catch(
    exception: HttpException | PrismaClientValidationError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const responseObj: ExceptionResponse = {
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: request.url,
      response: '',
    };

    if (exception instanceof HttpException) {
      responseObj.statusCode = exception.getStatus();
      responseObj.response = exception.getResponse();
    }

    if (exception instanceof PrismaClientValidationError) {
      responseObj.statusCode = HttpStatus.BAD_REQUEST;
      responseObj.response = exception.message.replaceAll('"', '');
    }

    responseObj.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    responseObj.response = 'Internal server error';

    this.logger.error(
      `Exception caught: ${exception.message}`,
      `AllExceptionsFilter ${request.ip}`,
    );
    response.status(responseObj.statusCode).json(responseObj);

    super.catch(exception, host);
  }
}
