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

  // Delete a single exact key (O(1), no SCAN needed)
  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  // Delete all keys matching a glob pattern using SCAN (safe for large datasets)
  async deleteByPattern(pattern: string): Promise<void> {
    let cursor = '0';
    do {
      const [next, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = next;
      if (keys.length) await this.redis.del(...keys);
    } while (cursor !== '0');
  }
}
