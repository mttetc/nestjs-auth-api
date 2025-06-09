import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@/core/redis/redis.service';

@Injectable()
export class TokenBlacklistService {
  private readonly prefix = 'blacklist:';

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async addToBlacklist(token: string, expiresIn: number): Promise<void> {
    const key = this.prefix + token;
    console.log('Blacklisting token:', key, 'TTL:', expiresIn);

    await this.redisService.set(key, '1', expiresIn);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const key = this.prefix + token;
    const exists = await this.redisService.get(key);
    return exists === '1';
  }

  async removeFromBlacklist(token: string): Promise<void> {
    const key = this.prefix + token;
    await this.redisService.del(key);
  }
}
