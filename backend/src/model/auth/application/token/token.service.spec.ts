import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import { mock, type MockProxy } from 'jest-mock-extended';

import { TokenService } from '@/model/auth/application/token/token.service';
import { makeUser } from '@/shared';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: MockProxy<JwtService>;
  let config: MockProxy<ConfigService>;

  beforeEach(() => {
    jwtService = mock<JwtService>();
    config = mock<ConfigService>();
    service = new TokenService(jwtService, config);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('signAccessToken', () => {
    it('signs the access token with the sub, email, and role, along with settings from ConfigService', async () => {
      const user = makeUser();

      config.getOrThrow.mockReturnValue('access-secret');
      config.get.mockReturnValue('15');
      jwtService.signAsync.mockResolvedValue('signed-access-token');

      const result = await service.signAccessToken(user);

      expect(config.getOrThrow).toHaveBeenCalledWith('JWT_ACCESS_SECRET');
      expect(config.get).toHaveBeenCalledWith('JWT_ACCESS_EXPIRES_IN');
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
        },
        {
          secret: 'access-secret',
          expiresIn: '15m',
        },
      );
      expect(result).toBe('signed-access-token');
    });

    it('throws an error if JWT_ACCESS_SECRET is not configured', async () => {
      config.getOrThrow.mockImplementation(() => {
        throw new Error('JWT_ACCESS_SECRET is not defined');
      });

      await expect(service.signAccessToken(makeUser())).rejects.toThrow(
        'JWT_ACCESS_SECRET is not defined',
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('signRefreshToken', () => {
    it('signs the refresh token only with the sub (without email or role) and settings from ConfigService', async () => {
      const user = makeUser();

      config.getOrThrow.mockReturnValue('refresh-secret');
      config.get.mockReturnValue('7d');
      jwtService.signAsync.mockResolvedValue('signed-refresh-token');

      const result = await service.signRefreshToken(user);

      expect(config.getOrThrow).toHaveBeenCalledWith('JWT_REFRESH_SECRET');
      expect(config.get).toHaveBeenCalledWith('JWT_REFRESH_EXPIRES_IN');
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: user.id },
        { secret: 'refresh-secret', expiresIn: '7d' },
      );
      expect(result).toBe('signed-refresh-token');
    });

    it('does not include the email and role in the refresh token payload', async () => {
      config.getOrThrow.mockReturnValue('refresh-secret');
      config.get.mockReturnValue('7d');
      jwtService.signAsync.mockResolvedValue('signed-refresh-token');

      await service.signRefreshToken(makeUser());

      const payload = jwtService.signAsync.mock.calls[0][0];

      expect(payload).not.toHaveProperty('email');
      expect(payload).not.toHaveProperty('role');
    });

    it('throws an error if JWT_REFRESH_SECRET is not configured', async () => {
      config.getOrThrow.mockImplementation(() => {
        throw new Error('JWT_REFRESH_SECRET is not defined');
      });

      await expect(service.signRefreshToken(makeUser())).rejects.toThrow(
        'JWT_REFRESH_SECRET is not defined',
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
