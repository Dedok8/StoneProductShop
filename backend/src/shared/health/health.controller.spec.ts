import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { HealthController } from '@/shared/health/health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health status and valid iso timestamp', () => {
      const mockDate = new Date('2026-07-17T12:00:00.000Z');
      jest.useFakeTimers().setSystemTime(mockDate);

      const result = controller.check();

      expect(result).toEqual({
        status: 'ok',
        timestamp: '2026-07-17T12:00:00.000Z',
      });

      jest.useRealTimers();
    });
  });
});
