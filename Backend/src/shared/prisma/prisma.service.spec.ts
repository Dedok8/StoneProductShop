import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('підключається до БД при ініціалізації', async () => {
      const connectSpy = jest
        .spyOn(service, '$connect')
        .mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(connectSpy).toHaveBeenCalledTimes(1);
    });

    it('реєструє обробники warn та error подій', async () => {
      const onSpy = jest
        .spyOn(service, '$on')
        .mockImplementation(() => service);
      jest.spyOn(service, '$connect').mockResolvedValue(undefined);

      await service.onModuleInit();

      const eventNames = onSpy.mock.calls.map(([event]) => event);
      expect(eventNames).toContain('warn');
      expect(eventNames).toContain('error');
    });

    it('реєструє обробник query тільки в development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const onSpy = jest
        .spyOn(service, '$on')
        .mockImplementation(() => service);
      jest.spyOn(service, '$connect').mockResolvedValue(undefined);

      await service.onModuleInit();

      const eventNames = onSpy.mock.calls.map(([event]) => event);
      expect(eventNames).toContain('query');

      process.env.NODE_ENV = originalEnv;
    });

    it('НЕ реєструє обробник query в production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const onSpy = jest
        .spyOn(service, '$on')
        .mockImplementation(() => service);
      jest.spyOn(service, '$connect').mockResolvedValue(undefined);

      await service.onModuleInit();

      const eventNames = onSpy.mock.calls.map(([event]) => event);
      expect(eventNames).not.toContain('query');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('onModuleDestroy', () => {
    it('відключається від БД при знищенні модуля', async () => {
      const disconnectSpy = jest
        .spyOn(service, '$disconnect')
        .mockResolvedValue(undefined);

      await service.onModuleDestroy();

      expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('onCleanDatabase', () => {
    it('очищає таблиці в тестовому середовищі', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      jest
        .spyOn(service, '$queryRaw')
        .mockResolvedValue([
          { tablename: 'User' },
          { tablename: 'Product' },
          { tablename: '_prisma_migrations' },
        ]);
      const execSpy = jest
        .spyOn(service, '$executeRawUnsafe')
        .mockResolvedValue(0);

      await service.onCleanDatabase();

      const calledTables = execSpy.mock.calls.map(([sql]) => sql);
      expect(calledTables.some((s) => s.includes('"User"'))).toBe(true);
      expect(calledTables.some((s) => s.includes('"Product"'))).toBe(true);
      expect(calledTables.some((s) => s.includes('_prisma_migrations'))).toBe(
        false,
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('кидає помилку якщо NODE_ENV !== test', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      await expect(service.onCleanDatabase()).rejects.toThrow(
        'cleanDatabase is only allowed in the test environment',
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('пропускає таблицю _prisma_migrations', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      jest
        .spyOn(service, '$queryRaw')
        .mockResolvedValue([{ tablename: '_prisma_migrations' }]);
      const execSpy = jest
        .spyOn(service, '$executeRawUnsafe')
        .mockResolvedValue(0);

      await service.onCleanDatabase();

      expect(execSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it('використовує TRUNCATE CASCADE RESTART IDENTITY', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      jest
        .spyOn(service, '$queryRaw')
        .mockResolvedValue([{ tablename: 'Order' }]);
      const execSpy = jest
        .spyOn(service, '$executeRawUnsafe')
        .mockResolvedValue(0);

      await service.onCleanDatabase();

      const [sql] = execSpy.mock.calls[0] as [string];
      expect(sql).toMatch(/TRUNCATE TABLE "Order" CASCADE RESTART IDENTITY/);

      process.env.NODE_ENV = originalEnv;
    });
  });
});
