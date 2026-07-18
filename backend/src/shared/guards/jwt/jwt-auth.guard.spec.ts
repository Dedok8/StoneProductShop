import type { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { JWTAuthGuard } from '@/shared/guards/jwt/jwt-auth.guard';

describe('JWTAuthGuard', () => {
  let guard: JWTAuthGuard;

  beforeEach(() => {
    guard = new JWTAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should delegate authentication to passport jwt-access strategy', async () => {
    const canActivateSpy = jest
      .spyOn(AuthGuard('jwt-access').prototype, 'canActivate')
      .mockImplementation(() => true);

    const mockContext = {} as ExecutionContext;
    const result = await guard.canActivate(mockContext);

    expect(canActivateSpy).toHaveBeenCalledWith(mockContext);
    expect(result).toBe(true);

    canActivateSpy.mockRestore();
  });
});
