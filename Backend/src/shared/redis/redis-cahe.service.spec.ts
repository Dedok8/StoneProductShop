import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { RedisCacheService } from './redis-cache.service';
import { RedisService } from './redis.service';

// ─── Тесты ────────────────────────────────────────────────────────────────

describe('RedisCacheService', () => {
  let service: RedisCacheService;

  const redis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    scan: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisCacheService,
        { provide: RedisService, useValue: redis },
      ],
    }).compile();

    service = module.get(RedisCacheService);
    jest.clearAllMocks();
  });

  // ─── setJson ────────────────────────────────────────────────────────────

  describe('setJson', () => {
    it('сохраняет значение с TTL при его наличии', async () => {
      redis.set.mockResolvedValue('OK');

      await service.setJson('my-key', { foo: 'bar' }, 300);

      expect(redis.set).toHaveBeenCalledWith(
        'my-key',
        JSON.stringify({ foo: 'bar' }),
        'EX',
        300,
      );
    });

    it('сохраняет значение без TTL если не передан', async () => {
      redis.set.mockResolvedValue('OK');

      await service.setJson('my-key', { foo: 'bar' });

      expect(redis.set).toHaveBeenCalledWith(
        'my-key',
        JSON.stringify({ foo: 'bar' }),
      );
      expect(redis.set).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        'EX',
        expect.anything(),
      );
    });

    it('сериализует объект в JSON-строку', async () => {
      redis.set.mockResolvedValue('OK');
      const value = { id: '1', name: 'Marble', price: 149.99 };

      await service.setJson('product:detail:1', value, 60);

      const [, serialized] = redis.set.mock.calls[0] as string[];
      expect(JSON.parse(serialized)).toEqual(value);
    });
  });

  // ─── getJson ────────────────────────────────────────────────────────────

  describe('getJson', () => {
    it('возвращает распарсенный объект при наличии ключа', async () => {
      const stored = { id: '1', name: 'Granite' };
      redis.get.mockResolvedValue(JSON.stringify(stored));

      const result = await service.getJson<typeof stored>('product:detail:1');

      expect(result).toEqual(stored);
    });

    it('возвращает null если ключ не найден', async () => {
      redis.get.mockResolvedValue(null);

      const result = await service.getJson('missing-key');

      expect(result).toBeNull();
    });

    it('возвращает null если JSON невалидный (parse error fallback)', async () => {
      redis.get.mockResolvedValue('not-valid-json{{{{');

      const result = await service.getJson('broken-key');

      expect(result).toBeNull();
    });

    it('не бросает исключение при невалидном JSON', async () => {
      redis.get.mockResolvedValue('{broken}');

      await expect(service.getJson('broken-key')).resolves.toBeNull();
    });
  });

  // ─── deleteByPattern ────────────────────────────────────────────────────

  describe('deleteByPattern', () => {
    it('удаляет ключи найденные через SCAN', async () => {
      redis.scan.mockResolvedValueOnce(['0', ['key:1', 'key:2']]);

      await service.deleteByPattern('key:*');

      expect(redis.del).toHaveBeenCalledWith('key:1', 'key:2');
    });

    it('не вызывает del если ключей нет', async () => {
      redis.scan.mockResolvedValueOnce(['0', []]);

      await service.deleteByPattern('nonexistent:*');

      expect(redis.del).not.toHaveBeenCalled();
    });

    it('итерирует несколько страниц SCAN до cursor === "0"', async () => {
      redis.scan
        .mockResolvedValueOnce(['42', ['key:1']])
        .mockResolvedValueOnce(['0', ['key:2']]);

      await service.deleteByPattern('key:*');

      expect(redis.scan).toHaveBeenCalledTimes(2);
      expect(redis.del).toHaveBeenCalledTimes(2);
    });

    it('использует SCAN вместо KEYS (не вызывает redis.keys)', async () => {
      redis.scan.mockResolvedValueOnce(['0', []]);
      const redisMock = redis as typeof redis & { keys?: jest.Mock };

      await service.deleteByPattern('product:*');

      expect(redisMock.keys).toBeUndefined();
      expect(redis.scan).toHaveBeenCalled();
    });
  });
});
