import { Controller, Get, Post, Body, Inject, Param } from '@nestjs/common';
import Redis from 'ioredis';

@Controller('redis-test')
export class RedisController {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  @Post('set')
  async setValue(@Body() body: { key: string; value: string }) {
    await this.redis.set(body.key, body.value);
    return { message: 'Value set successfully' };
  }

  @Get('get/:key')
  async getValue(@Param('key') key: string) {
    const value = await this.redis.get(key);
    return { value };
  }

  @Get('ping')
  async ping() {
    const result = await this.redis.ping();
    return { message: result };
  }
}
