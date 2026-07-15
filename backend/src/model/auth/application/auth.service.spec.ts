import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { mock, type MockProxy } from 'jest-mock-extended';

import type { TokenService } from '@/model/auth';
import { AuthService } from '@/model/auth';
import type { UserRepository } from '@/model/user';
import type { HashService } from '@/shared';
import { makeUser } from '@/shared';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: MockProxy<UserRepository>;
  let hashService: MockProxy<HashService>;
  let tokenService: MockProxy<TokenService>;

  beforeEach(() => {
    userRepository = mock<UserRepository>();
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
      email: 'Ivan@gmail.com',
      password: '!Password123',
    };

    it('registers the user and returns a pair of tokens if the email address is available', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      hashService.hash
        .mockResolvedValueOnce('hashed-password')
        .mockResolvedValueOnce('hashed-refresh-token');
      userRepository.create.mockResolvedValue(makeUser({ email: dto.email }));
      tokenService.signAccessToken.mockResolvedValue('access-token');
      tokenService.signRefreshToken.mockResolvedValue('refresh-token');

      const result = await service.register(dto);

      expect(userRepository.create).toHaveBeenCalledWith({
        name: dto.name,
        email: dto.email,
        passwordHash: 'hashed-password',
      });

      expect(userRepository.update).toHaveBeenLastCalledWith('user-1', {
        refreshToken: 'hashed-refresh-token',
      });

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('throws a ConflictException if the email address is already taken', async () => {
      userRepository.findByEmail.mockRejectedValue(makeUser());

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const dto = { email: 'Ivan@example.com', password: '!Password123' };

    it('logs the user in and returns a pair of tokens if the password is correct', async () => {
      const user = makeUser();

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

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('throws an UnauthorizedException if a user with that email address is not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(hashService.compare).not.toHaveBeenCalled();
    });

    it('Throws an UnauthorizedException if the password is incorrect', async () => {
      userRepository.findByEmail.mockResolvedValue(makeUser());
      hashService.compare.mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(tokenService.signAccessToken).not.toHaveBeenCalled();
    });

    it('does not specify which field is incorrect (email or password)—it displays a single error message', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(
        'Invalidate credentials',
      );
    });
  });

  describe('refresh', () => {
    it('Issues a new accessToken when a valid refreshToken is provided', async () => {
      const user = makeUser({ refreshToken: 'hashed-refresh-token' });
      userRepository.findById.mockResolvedValue(user);
      hashService.compare.mockResolvedValue(true);
      tokenService.signAccessToken.mockResolvedValue('new-access-token');

      const result = await service.refresh('user-1', 'raw-refresh-token');

      expect(hashService.compare).toHaveBeenCalledWith(
        'raw-refresh-token',
        'hashed-refresh-token',
      );
      expect(result).toEqual({ accessToken: 'new-access-token' });
    });

    it('Throws an UnauthorizedException if the user does not have a saved refresh token', async () => {
      userRepository.findById.mockRejectedValue(
        makeUser({ refreshToken: null }),
      );

      await expect(
        service.refresh('user-1', 'raw-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws an UnauthorizedException if the user is not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        service.refresh('missing', 'raw-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('Throws an UnauthorizedException if the refreshToken does not match the stored hash', async () => {
      userRepository.findById.mockResolvedValue(
        makeUser({ refreshToken: 'hash-refresh-token' }),
      );

      hashService.compare.mockResolvedValue(false);

      await expect(
        service.refresh('user-1', 'wrong-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);

      expect(tokenService.signRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it("sets the user's refreshToken to null", async () => {
      await service.logout('user-1');

      expect(userRepository.update).toHaveBeenCalledWith('user-1', {
        refreshToken: null,
      });
    });
  });
});
