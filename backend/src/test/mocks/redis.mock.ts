import type { DeepMockProxy } from 'jest-mock-extended';
import { mockDeep } from 'jest-mock-extended';

import { RedisCacheService } from '@/shared';

export const redisCacheMock: DeepMockProxy<RedisCacheService> =
  mockDeep<RedisCacheService>();

export const RedisCacheMockProvider = {
  provide: RedisCacheService,
  useValue: redisCacheMock,
};

beforeEach(() => {
  jest.resetAllMocks();
});
