import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { mock, type MockProxy } from 'jest-mock-extended';

import { AuthService } from '@/model/auth/application/auth.service';
import type { TokenService } from '@/model/auth/application/token';
import type { IUserRepository } from '@/model/user';
import { makeUser, type HashService } from '@/shared';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: MockProxy<IUserRepository>;
  let hashService: MockProxy<HashService>;
  let tokenService: MockProxy<TokenService>;

  beforeEach(() => {
    userRepository = mock<IUserRepository>();
    hashService = mock<HashService>();
    tokenService = mock<TokenService>();
    service = new AuthService(userRepository, hashService, tokenService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('register', () => {
    const dto = {
      name: 'Ivan',
      email: 'new@example.com',
      password: '!Password123',
    };

    it('creates the user and returns an access/refresh token pair', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      hashService.hash
        .mockResolvedValueOnce('hashed-password')
        .mockResolvedValueOnce('hashed-refresh-token');
      userRepository.create.mockResolvedValue(makeUser({ email: dto.email }));
      tokenService.signAccessToken.mockResolvedValue('access-token');
      tokenService.signRefreshToken.mockResolvedValue('refresh-token');

      const result = await service.register(dto);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(hashService.hash).toHaveBeenNthCalledWith(1, dto.password);
      expect(userRepository.create).toHaveBeenCalledWith({
        name: dto.name,
        email: dto.email,
        passwordHash: 'hashed-password',
      });
      expect(hashService.hash).toHaveBeenNthCalledWith(2, 'refresh-token');
      expect(userRepository.update).toHaveBeenCalledWith(expect.any(String), {
        refreshToken: 'hashed-refresh-token',
      });
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('throws a ConflictException if the email address is already in use', async () => {
      userRepository.findByEmail.mockResolvedValue(makeUser());

      await expect(service.register(dto)).rejects.toThrow(ConflictException);

      expect(userRepository.create).not.toHaveBeenCalled();
      expect(hashService.hash).not.toHaveBeenCalled();
      expect(tokenService.signAccessToken).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const dto = { email: 'ivan@example.com', password: '!Password123' };

    it('returns an access/refresh token pair if the credentials are correct', async () => {
      const user = makeUser({ email: dto.email });

      userRepository.findByEmail.mockResolvedValue(user);
      hashService.compare.mockResolvedValue(true);
      hashService.hash.mockResolvedValue('hashed-refresh-token');
      tokenService.signAccessToken.mockResolvedValue('access-token');
      tokenService.signRefreshToken.mockResolvedValue('refresh-token');

      const result = await service.login(dto);

      expect(hashService.compare).toHaveBeenCalledWith(
        dto.password,
        user.passwordHash,
      );
      expect(userRepository.update).toHaveBeenCalledWith(user.id, {
        refreshToken: 'hashed-refresh-token',
      });
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('throws an UnauthorizedException if the user is not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(hashService.compare).not.toHaveBeenCalled();
    });

    it('throws an UnauthorizedException if the password is incorrect', async () => {
      userRepository.findByEmail.mockResolvedValue(makeUser());
      hashService.compare.mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(tokenService.signAccessToken).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('returns a new access token if the refresh token is valid', async () => {
      const user = makeUser({ refreshToken: 'hashed-refresh-token' });

      userRepository.findById.mockResolvedValue(user);
      hashService.compare.mockResolvedValue(true);
      tokenService.signAccessToken.mockResolvedValue('new-access-token');

      const result = await service.refresh(user.id, 'raw-refresh-token');

      expect(userRepository.findById).toHaveBeenCalledWith(user.id);
      expect(hashService.compare).toHaveBeenCalledWith(
        'raw-refresh-token',
        'hashed-refresh-token',
      );
      expect(tokenService.signAccessToken).toHaveBeenCalledWith(user);
      expect(result).toEqual({ accessToken: 'new-access-token' });
    });

    it('throws an UnauthorizedException if the user is not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        service.refresh('missing', 'raw-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
      expect(hashService.compare).not.toHaveBeenCalled();
    });

    it('throws an UnauthorizedException if the user has no stored refresh token', async () => {
      userRepository.findById.mockResolvedValue(
        makeUser({ refreshToken: null }),
      );

      await expect(
        service.refresh('user-1', 'raw-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
      expect(hashService.compare).not.toHaveBeenCalled();
    });

    it('throws an UnauthorizedException if the refresh token does not match', async () => {
      userRepository.findById.mockResolvedValue(
        makeUser({ refreshToken: 'hashed-refresh-token' }),
      );
      hashService.compare.mockResolvedValue(false);

      await expect(
        service.refresh('user-1', 'wrong-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
      expect(tokenService.signAccessToken).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('clears the stored refresh token', async () => {
      await service.logout('user-1');

      expect(userRepository.update).toHaveBeenCalledWith('user-1', {
        refreshToken: null,
      });
    });
  });
});
