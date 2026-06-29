import { UserRole } from '@modules/user/domain';
import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';

import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;

  const jwtMock: jest.Mocked<Pick<JwtService, 'sign' | 'verify'>> = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const configMock: jest.Mocked<Pick<ConfigService, 'get'>> = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TokenService(
      jwtMock as unknown as JwtService,
      configMock as unknown as ConfigService,
    );
  });

  describe('signAccessToken', () => {
    it('подписывает токен с правильным payload и конфигурацией', () => {
      configMock.get
        .mockReturnValueOnce('access-secret')
        .mockReturnValueOnce('15m');
      jwtMock.sign.mockReturnValue('access-token');

      const payload = {
        sub: 'user-1',
        email: 'test@test.com',
        role: UserRole.USER,
      };

      const result = service.signAccessToken(payload);

      expect(jwtMock.sign).toHaveBeenCalledWith(payload, {
        secret: 'access-secret',
        expiresIn: '15m',
      });
      expect(result).toBe('access-token');
    });

    it('использует JWT_ACCESS_SECRET из конфига', () => {
      configMock.get
        .mockReturnValueOnce('my-custom-secret')
        .mockReturnValueOnce('15m');
      jwtMock.sign.mockReturnValue('token');

      service.signAccessToken({ sub: 'u', email: 'e', role: UserRole.USER });

      expect(configMock.get).toHaveBeenCalledWith('JWT_ACCESS_SECRET');
    });

    it('использует JWT_ACCESS_EXPIRES_IN из конфига', () => {
      configMock.get.mockReturnValueOnce('secret').mockReturnValueOnce('30m');
      jwtMock.sign.mockReturnValue('token');

      service.signAccessToken({ sub: 'u', email: 'e', role: UserRole.USER });

      expect(jwtMock.sign).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ expiresIn: '30m' }),
      );
    });
  });

  describe('signRefreshToken', () => {
    it('подписывает refresh токен с правильными параметрами', () => {
      configMock.get
        .mockReturnValueOnce('refresh-secret')
        .mockReturnValueOnce('7d');
      jwtMock.sign.mockReturnValue('refresh-token');

      const result = service.signRefreshToken({ sub: 'user-1' });

      expect(jwtMock.sign).toHaveBeenCalledWith(
        { sub: 'user-1' },
        { secret: 'refresh-secret', expiresIn: '7d' },
      );
      expect(result).toBe('refresh-token');
    });

    it('refresh токен содержит только sub — не email и не role', () => {
      configMock.get.mockReturnValue('secret');
      jwtMock.sign.mockReturnValue('token');

      service.signRefreshToken({ sub: 'user-1' });

      const [payload] = jwtMock.sign.mock.calls[0];
      expect(payload).toEqual({ sub: 'user-1' });
      expect(payload).not.toHaveProperty('email');
      expect(payload).not.toHaveProperty('role');
    });

    it('использует другой секрет чем access токен', () => {
      configMock.get
        .mockReturnValueOnce('access-secret')
        .mockReturnValueOnce('15m');
      jwtMock.sign.mockReturnValue('access');
      service.signAccessToken({ sub: 'u', email: 'e', role: UserRole.USER });

      jest.clearAllMocks();

      configMock.get
        .mockReturnValueOnce('refresh-secret')
        .mockReturnValueOnce('7d');
      jwtMock.sign.mockReturnValue('refresh');
      service.signRefreshToken({ sub: 'u' });

      const [, refreshOpts] = jwtMock.sign.mock.calls[0] as [
        unknown,
        { secret: string },
      ];
      expect(refreshOpts.secret).toBe('refresh-secret');
    });
  });

  describe('verifyRefreshToken', () => {
    it('верифицирует токен и возвращает payload', () => {
      const payload = { sub: 'user-1' };
      configMock.get.mockReturnValue('refresh-secret');
      jwtMock.verify.mockReturnValue(payload);

      const result = service.verifyRefreshToken('some-token');

      expect(jwtMock.verify).toHaveBeenCalledWith('some-token', {
        secret: 'refresh-secret',
      });
      expect(result).toEqual(payload);
    });

    it('пробрасывает ошибку если токен истёк', () => {
      configMock.get.mockReturnValue('secret');
      jwtMock.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      expect(() => service.verifyRefreshToken('expired-token')).toThrow(
        'jwt expired',
      );
    });

    it('пробрасывает ошибку если токен невалиден', () => {
      configMock.get.mockReturnValue('secret');
      jwtMock.verify.mockImplementation(() => {
        throw new Error('invalid signature');
      });

      expect(() => service.verifyRefreshToken('tampered-token')).toThrow(
        'invalid signature',
      );
    });
  });
});
