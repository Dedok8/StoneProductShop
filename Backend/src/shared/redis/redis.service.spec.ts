import { ConfigService } from '@nestjs/config';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { RedisService } from './redis.service';

const mockOn = jest.fn().mockReturnThis();
const mockConnect = jest.fn().mockResolvedValue(undefined);
const mockQuit = jest.fn().mockResolvedValue(undefined);

jest.mock('ioredis', () => {
  class MockRedis {
    on = mockOn;
    connect = mockConnect;
    quit = mockQuit;

    constructor(_options: unknown) {}
  }

  return { default: MockRedis, __esModule: true };
});

const makeConfigService = (overrides: Record<string, unknown> = {}) => ({
  get: jest.fn((key: string, defaultValue?: unknown) => {
    const config: Record<string, unknown> = {
      REDIS_HOST: 'localhost',
      REDIS_PORT: 6379,
      REDIS_PASSWORD: undefined,
      ...overrides,
    };
    return config[key] ?? defaultValue;
  }),
});

describe('RedisService', () => {
  let service: RedisService;
  let configService: ReturnType<typeof makeConfigService>;

  beforeEach(async () => {
    configService = makeConfigService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('підключається до Redis при ініціалізації', async () => {
      const connectSpy = jest
        .spyOn(service, 'connect')
        .mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(connectSpy).toHaveBeenCalledTimes(1);
    });

    it('кидає помилку якщо connect() провалився', async () => {
      const error = new Error('Connection refused');
      jest.spyOn(service, 'connect').mockRejectedValue(error);

      await expect(service.onModuleInit()).rejects.toThrow(
        'Connection refused',
      );
    });
  });

  describe('onModuleDestroy', () => {
    it('викликає quit() при знищенні модуля', async () => {
      const quitSpy = jest.spyOn(service, 'quit').mockResolvedValue('OK');

      await service.onModuleDestroy();

      expect(quitSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('config', () => {
    it('зчитує REDIS_HOST з ConfigService', () => {
      expect(configService.get).toHaveBeenCalledWith('REDIS_HOST', 'localhost');
    });

    it('зчитує REDIS_PORT з ConfigService', () => {
      expect(configService.get).toHaveBeenCalledWith('REDIS_PORT', 6379);
    });

    it('зчитує REDIS_PASSWORD з ConfigService', () => {
      expect(configService.get).toHaveBeenCalledWith('REDIS_PASSWORD');
    });
  });

  describe('error handling', () => {
    it('реєструє обробник події error під час конструктора', () => {
      const errorCalls = mockOn.mock.calls.filter(
        ([event]) => event === 'error',
      );
      expect(errorCalls.length).toBeGreaterThanOrEqual(1);
    });
  });
});
