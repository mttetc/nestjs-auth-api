import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Application')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({
    summary: 'API information',
    description: 'Returns basic information about the API',
  })
  @ApiResponse({
    status: 200,
    description: 'API information',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'NestJS REST API' },
        version: { type: 'string', example: '1.0.0' },
        description: {
          type: 'string',
          example: 'A robust REST API built with NestJS',
        },
        documentation: { type: 'string', example: '/api' },
        health: { type: 'string', example: '/health' },
      },
    },
  })
  getApiInfo(): object {
    return {
      name: 'NestJS REST API',
      version: process.env.npm_package_version || '1.0.0',
      description: 'A robust REST API built with NestJS',
      documentation: '/api',
      health: '/health',
    };
  }
}
