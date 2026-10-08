import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { MockProxy } from 'jest-mock-extended';
import { mock } from 'jest-mock-extended';

import { RedisCacheService } from './redis-cache.service';
import { RedisService } from './redis.service';

describe('RedisCacheService', () => {
  let service: RedisCacheService;
  let redis: MockProxy<RedisService>;

  beforeEach(async () => {
    redis = mock<RedisService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisCacheService,
        { provide: RedisService, useValue: redis },
      ],
    }).compile();

    service = module.get<RedisCacheService>(RedisCacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setJson', () => {
    it('should stringify the value and set it with TTL when provided', async () => {
      const value = { id: 1, name: 'stone' };
      redis.set.mockResolvedValue('OK');

      const result = await service.setJson('product:1', value, 60);

      expect(redis.set).toHaveBeenCalledWith(
        'product:1',
        JSON.stringify(value),
        'EX',
        60,
      );
      expect(result).toBe('OK');
    });

    it('should stringify the value and set it without TTL when not provided', async () => {
      const value = { id: 2, name: 'marble' };
      redis.set.mockResolvedValue('OK');

      const result = await service.setJson('product:2', value);

      expect(redis.set).toHaveBeenCalledWith(
        'product:2',
        JSON.stringify(value),
      );
      expect(redis.set).toHaveBeenCalledTimes(1);
      expect(result).toBe('OK');
    });
  });

  describe('getJson', () => {
    it('should return the parsed value when the key exists', async () => {
      const value = { id: 1, name: 'stone' };
      redis.get.mockResolvedValue(JSON.stringify(value));

      const result = await service.getJson<typeof value>('product:1');

      expect(redis.get).toHaveBeenCalledWith('product:1');
      expect(result).toEqual(value);
    });

    it('should return null when the key does not exist', async () => {
      redis.get.mockResolvedValue(null);

      const result = await service.getJson('missing:key');

      expect(result).toBeNull();
    });

    it('should return null when the stored value is not valid JSON', async () => {
      redis.get.mockResolvedValue('{not-valid-json');

      const result = await service.getJson('broken:key');

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should call del with the given key', async () => {
      redis.del.mockResolvedValue(1);

      await service.delete('product:1');

      expect(redis.del).toHaveBeenCalledWith('product:1');
    });
  });

  describe('deleteByPattern', () => {
    it('should scan and delete all keys matching the pattern across a single page', async () => {
      redis.scan.mockResolvedValue(['0', ['product:1', 'product:2']]);
      redis.del.mockResolvedValue(2);

      await service.deleteByPattern('product:*');

      expect(redis.scan).toHaveBeenCalledWith(
        '0',
        'MATCH',
        'product:*',
        'COUNT',
        100,
      );
      expect(redis.del).toHaveBeenCalledWith('product:1', 'product:2');
      expect(redis.del).toHaveBeenCalledTimes(1);
    });

    it('should follow the cursor across multiple pages until it returns to 0', async () => {
      redis.scan
        .mockResolvedValueOnce(['17', ['product:1']])
        .mockResolvedValueOnce(['0', ['product:2']]);
      redis.del.mockResolvedValue(1);

      await service.deleteByPattern('product:*');

      expect(redis.scan).toHaveBeenNthCalledWith(
        1,
        '0',
        'MATCH',
        'product:*',
        'COUNT',
        100,
      );
      expect(redis.scan).toHaveBeenNthCalledWith(
        2,
        '17',
        'MATCH',
        'product:*',
        'COUNT',
        100,
      );
      expect(redis.del).toHaveBeenNthCalledWith(1, 'product:1');
      expect(redis.del).toHaveBeenNthCalledWith(2, 'product:2');
    });

    it('should not call del when a page returns no matching keys', async () => {
      redis.scan.mockResolvedValue(['0', []]);

      await service.deleteByPattern('product:*');

      expect(redis.del).not.toHaveBeenCalled();
    });
  });
});
