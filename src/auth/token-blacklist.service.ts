import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class TokenBlacklistService {
  private readonly prefix = 'blacklist:';

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {}

  async addToBlacklist(token: string, expiresIn: number): Promise<void> {
    const key = this.prefix + token;
    await this.redis.set(key, '1', 'EX', expiresIn);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const key = this.prefix + token;
    const exists = await this.redis.exists(key);
    return exists === 1;
  }

  async removeFromBlacklist(token: string): Promise<void> {
    const key = this.prefix + token;
    await this.redis.del(key);
  }
}
