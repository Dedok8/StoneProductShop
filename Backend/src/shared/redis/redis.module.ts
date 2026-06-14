import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisCacheService } from './redis-cache.service';

@Global()
@Module({
  imports: [RedisCacheService],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
