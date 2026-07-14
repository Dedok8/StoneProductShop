import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import type { MockProxy } from 'jest-mock-extended';
import { mock } from 'jest-mock-extended';

import { TokenService } from '@/model/auth/application/token/token.service';
import { UserEntity } from '@/model/user/domain/entities';
import { UserRole } from '@/shared/guards/role/user-role';

const makeUser = (overrides: Partial<UserEntity> = {}): UserEntity =>
  new UserEntity({
    id: 'user-1',
    name: 'John Stone',
    email: 'john@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.USER,
    refreshToken: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  });

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
    it('подписывает access-токен с sub/email/role и настройками из ConfigService', async () => {
      const user = makeUser();
      config.getOrThrow.mockReturnValue('access-secret');
      config.get.mockReturnValue('15m');
      jwtService.signAsync.mockResolvedValue('signed-access-token');

      const result = await service.signAccessToken(user);

      expect(config.getOrThrow).toHaveBeenCalledWith('JWT_ACCESS_SECRET');
      expect(config.get).toHaveBeenCalledWith('JWT_ACCESS_EXPIRES_IN');
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: user.id, email: user.email, role: user.role },
        { secret: 'access-secret', expiresIn: '15m' },
      );
      expect(result).toBe('signed-access-token');
    });

    it('выбрасывает ошибку, если JWT_ACCESS_SECRET не сконфигурирован', async () => {
      config.getOrThrow.mockImplementation(() => {
        throw new Error('JWT_ACCESS_SECRET is not defined');
      });

      await expect(service.signAccessToken(makeUser())).rejects.toThrow(
        'JWT_ACCESS_SECRET is not defined',
      );
    });
  });

  describe('signRefreshToken', () => {
    it('подписывает refresh-токен только с sub (без email/role) и настройками из ConfigService', async () => {
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

    it('не включает email и role в payload refresh-токена', async () => {
      config.getOrThrow.mockReturnValue('refresh-secret');
      config.get.mockReturnValue('7d');
      jwtService.signAsync.mockResolvedValue('signed-refresh-token');

      await service.signRefreshToken(makeUser());

      const payload = jwtService.signAsync.mock.calls[0][0];
      expect(payload).not.toHaveProperty('email');
      expect(payload).not.toHaveProperty('role');
    });
  });
});
