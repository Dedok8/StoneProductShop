import type { DeepMockProxy } from 'jest-mock-extended';
import { mockDeep } from 'jest-mock-extended';

import type { PrismaClient } from '@/generated/prisma/client';
import { PrismaService } from '@/shared';

export const prismaMock: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();

export const PrismaMockProvider = {
  provide: PrismaService,
  useValue: prismaMock,
};

beforeEach(() => {
  jest.resetAllMocks();
});
