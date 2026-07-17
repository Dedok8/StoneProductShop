import type { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { mock, type MockProxy } from 'jest-mock-extended';

import type {
  AccessTokenResponseDto,
  AuthService,
} from '@/model/auth/application';
import type { IRefreshTokenPayload } from '@/model/auth/domain';
import { AuthController } from '@/model/auth/presentation/auth.controller';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_PATH = '/api/v1/auth';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

describe('authController', () => {
  let controller: AuthController;
  let authService: MockProxy<AuthService>;
  let config: MockProxy<ConfigService>;
  let res: MockProxy<Response>;

  beforeEach(() => {
    authService = mock<AuthService>();
    config = mock<ConfigService>();
    res = mock<Response>();
    controller = new AuthController(authService, config);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('register', () => {
    const dto = {
      name: 'Ivan',
      email: 'ivan@example.com',
      password: '!Password123',
    };

    it('registers the user and returns only the accessToken in the response body', async () => {
      config.get.mockReturnValue('development');
      authService.register.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const result = await controller.register(dto, res);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ accessToken: 'access-token' });
      expect(result).not.toHaveProperty('refreshToken');
    });

    it('sets the refreshToken as an httpOnly cookie scoped to the auth path', async () => {
      config.get.mockReturnValue('development');
      authService.register.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      await controller.register(dto, res);

      expect(res.cookie).toHaveBeenCalledWith(
        REFRESH_COOKIE_NAME,
        'refresh-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: REFRESH_COOKIE_PATH,
          maxAge: REFRESH_COOKIE_MAX_AGE,
        }),
      );
    });

    it('marks the refresh cookie as secure in production', async () => {
      config.get.mockReturnValue('production');
      authService.register.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      await controller.register(dto, res);

      expect(res.cookie).toHaveBeenCalledWith(
        REFRESH_COOKIE_NAME,
        'refresh-token',
        expect.objectContaining({ secure: true }),
      );
    });

    it('does not mark the refresh cookie as secure outside production', async () => {
      config.get.mockReturnValue('test');
      authService.register.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      await controller.register(dto, res);

      expect(res.cookie).toHaveBeenCalledWith(
        REFRESH_COOKIE_NAME,
        'refresh-token',
        expect.objectContaining({ secure: false }),
      );
    });
  });

  describe('login', () => {
    const dto = {
      email: 'ivan@example.com',
      password: '!Password123',
    };

    it('logs the user in and returns only the accessToken in the response body', async () => {
      config.get.mockReturnValue('development');
      authService.login.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const result = await controller.login(dto, res);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ accessToken: 'access-token' });
    });

    it('sets the refreshToken cookie, same as register', async () => {
      config.get.mockReturnValue('development');
      authService.login.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      await controller.login(dto, res);

      expect(res.cookie).toHaveBeenCalledWith(
        REFRESH_COOKIE_NAME,
        'refresh-token',
        expect.objectContaining({ path: REFRESH_COOKIE_PATH }),
      );
    });
  });

  describe('refresh', () => {
    it('delegates to authService.refresh with the sub and refreshToken from the payload', async () => {
      const payload = {
        sub: 'user-1',
        refreshToken: 'raw-refresh-token',
      } as IRefreshTokenPayload & { refreshToken: string };
      const tokenResponse = {
        accessToken: 'new-access-token',
      } as AccessTokenResponseDto;
      authService.refresh.mockResolvedValue(tokenResponse);

      const result = await controller.refresh(payload);

      expect(authService.refresh).toHaveBeenCalledWith(
        'user-1',
        'raw-refresh-token',
      );
      expect(result).toBe(tokenResponse);
    });

    it('does not set or touch any cookies', async () => {
      const payload = {
        sub: 'user-1',
        refreshToken: 'raw-refresh-token',
      } as IRefreshTokenPayload & { refreshToken: string };
      authService.refresh.mockResolvedValue({
        accessToken: 'new-access-token',
      });

      await controller.refresh(payload);

      expect(res.cookie).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('delegates to authService.logout with the current user id', async () => {
      await controller.logout('user-1', res);

      expect(authService.logout).toHaveBeenCalledWith('user-1');
    });

    it('clears the refresh cookie scoped to the auth path', async () => {
      await controller.logout('user-1', res);

      expect(res.clearCookie).toHaveBeenCalledWith(REFRESH_COOKIE_NAME, {
        path: REFRESH_COOKIE_PATH,
      });
    });
  });
});
