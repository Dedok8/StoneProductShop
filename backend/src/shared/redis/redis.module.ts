import { Global, Module } from '@nestjs/common';

import { RedisCacheService } from '@/shared/redis/redis-cache.service';
import { RedisService } from '@/shared/redis/redis.service';

@Global()
@Module({
  providers: [RedisService, RedisCacheService],
  exports: [RedisService, RedisCacheService],
})
export class RedisModule {}
