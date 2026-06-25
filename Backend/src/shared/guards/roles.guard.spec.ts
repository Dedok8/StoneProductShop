import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';

import { RolesGuard } from './roles.guard';

const mockReflector = {
  getAllAndOverride: jest.fn(),
};

function createMockContext(userRole: string): ExecutionContext {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({
        user: { role: userRole },
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;

  beforeEach(() => {
    guard = new RolesGuard(mockReflector as unknown as Reflector);
    jest.clearAllMocks();
  });

  it('должен пропустить запрос если роли не указаны', () => {
    mockReflector.getAllAndOverride.mockReturnValue(null);
    const ctx = createMockContext('USER');
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('должен разрешить ADMIN доступ к защищённому эндпоинту', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const ctx = createMockContext('ADMIN');
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('должен запретить USER доступ к ADMIN эндпоинту', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const ctx = createMockContext('USER');
    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('должен разрешить если роль совпадает с одной из нескольких', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN', 'MODERATOR']);
    const ctx = createMockContext('MODERATOR');
    expect(guard.canActivate(ctx)).toBe(true);
  });
});
