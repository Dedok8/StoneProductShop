import { ConflictException, UnauthorizedException } from '@nestjs/common';
import type { MockProxy } from 'jest-mock-extended';
import { mock } from 'jest-mock-extended';

import { AuthService } from '@/model/auth/application/auth.service';
import type { TokenService } from '@/model/auth/application/token';
import { UserEntity } from '@/model/user/domain/entities';
import type { IUserRepository } from '@/model/user/domain/interfaces';
import type { HashService } from '@/shared';
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
      name: 'New User',
      email: 'new@example.com',
      password: 'Password123',
    };

    it('регистрирует пользователя и возвращает пару токенов, если email свободен', async () => {
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
      expect(userRepository.update).toHaveBeenCalledWith('user-1', {
        refreshToken: 'hashed-refresh-token',
      });
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('выбрасывает ConflictException, если email уже занят', async () => {
      userRepository.findByEmail.mockResolvedValue(makeUser());

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const dto = { email: 'john@example.com', password: 'Password123' };

    it('логинит пользователя и возвращает пару токенов при верном пароле', async () => {
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

    it('выбрасывает UnauthorizedException, если пользователь с таким email не найден', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(hashService.compare).not.toHaveBeenCalled();
    });

    it('выбрасывает UnauthorizedException при неверном пароле', async () => {
      userRepository.findByEmail.mockResolvedValue(makeUser());
      hashService.compare.mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(tokenService.signAccessToken).not.toHaveBeenCalled();
    });

    it('не раскрывает, что именно неверно (email или пароль) — единое сообщение об ошибке', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refresh', () => {
    it('выдаёт новый accessToken при валидном refreshToken', async () => {
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

    it('выбрасывает UnauthorizedException, если у пользователя нет сохранённого refreshToken', async () => {
      userRepository.findById.mockResolvedValue(
        makeUser({ refreshToken: null }),
      );

      await expect(
        service.refresh('user-1', 'raw-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('выбрасывает UnauthorizedException, если пользователь не найден', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        service.refresh('missing', 'raw-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('выбрасывает UnauthorizedException, если refreshToken не совпадает с сохранённым хэшем', async () => {
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
    it('сбрасывает refreshToken пользователя в null', async () => {
      await service.logout('user-1');

      expect(userRepository.update).toHaveBeenCalledWith('user-1', {
        refreshToken: null,
      });
    });
  });
});
