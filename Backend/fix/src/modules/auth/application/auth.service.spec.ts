import { TokenService } from '@modules/auth/infrastructure';
import { UserRepository, UserRole } from '@modules/user/domain';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { HashService } from '@shared/services';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepo = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockHashService = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const mockTokenService = {
    signAccessToken: jest.fn(),
    signRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: mockUserRepo },
        { provide: HashService, useValue: mockHashService },
        { provide: TokenService, useValue: mockTokenService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('должен зарегистрировать пользователя и вернуть токены', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);

      mockHashService.hash
        .mockResolvedValueOnce('hashed-password')
        .mockResolvedValueOnce('hashed-refresh');

      mockUserRepo.create.mockResolvedValue({
        id: '1',
        email: 'new@test.com',
        role: UserRole.USER,
      });

      mockTokenService.signAccessToken.mockReturnValue('access-token');
      mockTokenService.signRefreshToken.mockReturnValue('refresh-token');

      const result = await service.register({
        email: 'new@test.com',
        password: '123456',
        name: 'Ivan',
      });

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      expect(mockUserRepo.create).toHaveBeenCalled();
      expect(mockHashService.hash).toHaveBeenCalled();
    });

    it('должен выбросить ConflictException если email уже занят', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ id: '1' });

      await expect(
        service.register({
          email: 'exists@test.com',
          password: '123',
          name: 'Ivan',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('должен вернуть токены при валидных данных', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        passwordHash: 'hashed-pass',
        role: UserRole.USER,
      });

      mockHashService.compare.mockResolvedValue(true);

      mockTokenService.signAccessToken.mockReturnValue('access-token');
      mockTokenService.signRefreshToken.mockReturnValue('refresh-token');

      mockHashService.hash.mockResolvedValue('hashed-refresh');

      const result = await service.login({
        email: 'test@test.com',
        password: '123456',
      });

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('должен выбросить UnauthorizedException если пользователь не найден', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'notfound@test.com',
          password: '123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('должен выбросить UnauthorizedException при неверном пароле', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        passwordHash: 'hashed-pass',
        role: UserRole.USER,
      });

      mockHashService.compare.mockResolvedValue(false);

      await expect(
        service.login({
          email: 'test@test.com',
          password: 'wrong',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('должен выдать новые токены при валидном refresh token', async () => {
      mockTokenService.verifyRefreshToken.mockReturnValue({ sub: '1' });

      mockUserRepo.findById.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        role: UserRole.USER,
        refreshToken: 'hashed-refresh',
      });

      mockHashService.compare.mockResolvedValue(true);

      mockTokenService.signAccessToken.mockReturnValue('new-access');
      mockTokenService.signRefreshToken.mockReturnValue('new-refresh');

      mockHashService.hash.mockResolvedValue('hashed-new-refresh');

      const result = await service.refresh('refresh-token');

      expect(result).toEqual({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });
    });

    it('должен выбросить UnauthorizedException при невалидном refresh token', async () => {
      mockTokenService.verifyRefreshToken.mockImplementation(() => {
        throw new Error();
      });

      await expect(service.refresh('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('должен очистить refresh token', async () => {
      mockUserRepo.update.mockResolvedValue(true);

      await service.logout('1');

      expect(mockUserRepo.update).toHaveBeenCalledWith('1', {
        refreshToken: null,
      });
    });
  });
});
