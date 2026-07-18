import type { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { JWTRefreshGuard } from '@/shared/guards/jwt/jwt-refresh.guard';

describe('JWTRefreshGuard', () => {
  let guard: JWTRefreshGuard;

  beforeEach(() => {
    guard = new JWTRefreshGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should delegate authentication to passport jwt-refresh strategy', async () => {
    const canActivateSpy = jest
      .spyOn(AuthGuard('jwt-refresh').prototype, 'canActivate')
      .mockImplementation(() => true);

    const mockContext = {} as ExecutionContext;
    const result = await guard.canActivate(mockContext);

    expect(canActivateSpy).toHaveBeenCalledWith(mockContext);
    expect(result).toBe(true);

    canActivateSpy.mockRestore();
  });
});
