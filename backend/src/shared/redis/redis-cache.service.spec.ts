import type { MockProxy } from 'jest-mock-extended';
import { mock } from 'jest-mock-extended';

import { RedisCacheService } from './redis-cache.service';
import type { RedisService } from './redis.service';

describe('RedisCacheService', () => {
  let service: RedisCacheService;
  let redis: MockProxy<RedisService>;

  beforeEach(() => {
    redis = mock<RedisService>();
    service = new RedisCacheService(redis);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('setJson', () => {
    it('stringifies the value and sets it without expiry if no ttl is provided', async () => {
      await service.setJson('key-1', { a: 1 });

      expect(redis.set).toHaveBeenCalledWith('key-1', JSON.stringify({ a: 1 }));
    });

    it('sets the value with an EX ttl if a ttl is provided', async () => {
      await service.setJson('key-1', { a: 1 }, 60);

      expect(redis.set).toHaveBeenCalledWith(
        'key-1',
        JSON.stringify({ a: 1 }),
        'EX',
        60,
      );
    });
  });

  describe('getJson', () => {
    it('returns the parsed value if it exists', async () => {
      redis.get.mockResolvedValue(JSON.stringify({ a: 1 }));

      const result = await service.getJson<{ a: number }>('key-1');

      expect(result).toEqual({ a: 1 });
    });

    it('returns null if the key does not exist', async () => {
      redis.get.mockResolvedValue(null);

      const result = await service.getJson('key-1');

      expect(result).toBeNull();
    });

    it('returns null instead of throwing if the stored value is not valid JSON', async () => {
      redis.get.mockResolvedValue('not-json{');

      const result = await service.getJson('key-1');

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('deletes the given key', async () => {
      await service.delete('key-1');

      expect(redis.del).toHaveBeenCalledWith('key-1');
    });
  });

  describe('deleteByPattern', () => {
    it('deletes all matched keys in a single scan pass', async () => {
      redis.scan.mockResolvedValue(['0', ['key-1', 'key-2']]);

      await service.deleteByPattern('key-*');

      expect(redis.scan).toHaveBeenCalledWith(
        '0',
        'MATCH',
        'key-*',
        'COUNT',
        100,
      );
      expect(redis.del).toHaveBeenCalledWith('key-1', 'key-2');
    });

    it('iterates over multiple scan cursors until the cursor returns to 0', async () => {
      redis.scan
        .mockResolvedValueOnce(['5', ['key-1']])
        .mockResolvedValueOnce(['0', ['key-2']]);

      await service.deleteByPattern('key-*');

      expect(redis.scan).toHaveBeenCalledTimes(2);
      expect(redis.del).toHaveBeenNthCalledWith(1, 'key-1');
      expect(redis.del).toHaveBeenNthCalledWith(2, 'key-2');
    });

    it('does not call del if a scan iteration returns no keys', async () => {
      redis.scan.mockResolvedValue(['0', []]);

      await service.deleteByPattern('key-*');

      expect(redis.del).not.toHaveBeenCalled();
    });
  });
});
