import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import type { MockProxy } from 'jest-mock-extended';
import { mock } from 'jest-mock-extended';

import { RolesGuard } from '@/shared/guards/role/roles.guard';
import { UserRole } from '@/shared/guards/role/user-role';

describe('rolesGuard', () => {
  let guard: RolesGuard;
  let reflector: MockProxy<Reflector>;

  const buildContext = (user?: { role: UserRole }): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = mock<Reflector>();
    guard = new RolesGuard(reflector);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('allows the request when no @Roles() metadata is set on the route', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const result = await guard.canActivate(
      buildContext({ role: UserRole.USER }),
    );

    expect(result).toBe(true);
  });

  it('denies the request when roles are required but request.user is missing', async () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    const result = await guard.canActivate(buildContext(undefined));

    expect(result).toBe(false);
  });

  it('allows the request when the user role is in the required roles list', async () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    const result = await guard.canActivate(
      buildContext({ role: UserRole.ADMIN }),
    );

    expect(result).toBe(true);
  });

  it('denies the request when the user role is not in the required roles list', async () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    const result = await guard.canActivate(
      buildContext({ role: UserRole.USER }),
    );

    expect(result).toBe(false);
  });

  it('reads roles metadata from both the handler and the class (getAllAndOverride)', async () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
    const context = buildContext({ role: UserRole.ADMIN });

    await guard.canActivate(context);

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
      expect.anything(),
      [context.getHandler(), context.getClass()],
    );
  });
});
