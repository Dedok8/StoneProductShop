import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class RedisCacheService {
  constructor(private readonly redis: RedisService) {}

  async setJson<T>(key: string, value: T, ttl?: number) {
    const data = JSON.stringify(value);

    return ttl
      ? this.redis.set(key, data, 'EX', ttl)
      : this.redis.set(key, data);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async deleteByPattern(pattern: string) {
    const keys = await this.redis.keys(pattern);
    if (keys.length) {
      await this.redis.del(...keys);
    }
  }
}
