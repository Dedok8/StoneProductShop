import { TokenService } from '@modules/auth/infrastructure';
import { UserRepository, UserRole } from '@modules/user/domain';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { HashService } from '@shared/services';

import { AuthService } from './auth.service';

// ─── Фабрики тестовых данных ───────────────────────────────────────────────

const makeUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'test@test.com',
  passwordHash: 'hashed-password',
  role: UserRole.USER,
  refreshToken: 'hashed-refresh-token',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRegisterDto = (overrides = {}) => ({
  name: 'Ivan',
  email: 'test@test.com',
  password: 'password123',
  ...overrides,
});

const makeLoginDto = (overrides = {}) => ({
  email: 'test@test.com',
  password: 'password123',
  ...overrides,
});

// ─── Тесты ────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;

  // Типизированные моки — при изменении сигнатуры тест упадёт
  const userRepo: jest.Mocked<
    Pick<UserRepository, 'findByEmail' | 'findById' | 'create' | 'update'>
  > = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const hashService = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const tokenService = {
    signAccessToken: jest.fn(),
    signRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: userRepo },
        { provide: HashService, useValue: hashService },
        { provide: TokenService, useValue: tokenService },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  // ─── register ─────────────────────────────────────────────────────────────

  describe('register', () => {
    it('успешная регистрация — возвращает токены', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      userRepo.create.mockResolvedValue(makeUser());
      hashService.hash
        .mockResolvedValueOnce('hashed-password') // hash пароля
        .mockResolvedValueOnce('hashed-refresh'); // hash refresh токена
      tokenService.signAccessToken.mockReturnValue('access-token');
      tokenService.signRefreshToken.mockReturnValue('refresh-token');

      const result = await service.register(makeRegisterDto());

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('register — проверяет что email уже не занят', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      userRepo.create.mockResolvedValue(makeUser());
      hashService.hash.mockResolvedValue('hash');
      tokenService.signAccessToken.mockReturnValue('a');
      tokenService.signRefreshToken.mockReturnValue('r');

      await service.register(makeRegisterDto());

      expect(userRepo.findByEmail).toHaveBeenCalledWith('test@test.com');
    });

    it('register — хеширует пароль перед сохранением', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      userRepo.create.mockResolvedValue(makeUser());
      hashService.hash.mockResolvedValue('hashed-password');
      tokenService.signAccessToken.mockReturnValue('a');
      tokenService.signRefreshToken.mockReturnValue('r');

      await service.register(makeRegisterDto({ password: 'plaintext' }));

      expect(hashService.hash).toHaveBeenCalledWith('plaintext');
      // убеждаемся что чистый пароль не попал в create
      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ passwordHash: 'hashed-password' }),
      );
      expect(userRepo.create).not.toHaveBeenCalledWith(
        expect.objectContaining({ password: expect.anything() as unknown }),
      );
    });

    it('register — назначает роль USER по умолчанию', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      userRepo.create.mockResolvedValue(makeUser());
      hashService.hash.mockResolvedValue('hash');
      tokenService.signAccessToken.mockReturnValue('a');
      tokenService.signRefreshToken.mockReturnValue('r');

      await service.register(makeRegisterDto());

      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: UserRole.USER }),
      );
    });

    it('register — сохраняет хеш refresh токена, не сам токен', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      userRepo.create.mockResolvedValue(makeUser());
      hashService.hash
        .mockResolvedValueOnce('hashed-password')
        .mockResolvedValueOnce('hashed-refresh');
      tokenService.signAccessToken.mockReturnValue('access');
      tokenService.signRefreshToken.mockReturnValue('refresh-plain');

      await service.register(makeRegisterDto());

      // второй вызов hash — это хеширование refresh токена
      expect(hashService.hash).toHaveBeenNthCalledWith(2, 'refresh-plain');
      // в базу должен уйти хеш, не plain
      expect(userRepo.update).toHaveBeenCalledWith(
        makeUser().id,
        expect.objectContaining({ refreshToken: 'hashed-refresh' }),
      );
    });

    it('ConflictException если email занят', async () => {
      userRepo.findByEmail.mockResolvedValue(makeUser());

      await expect(service.register(makeRegisterDto())).rejects.toThrow(
        ConflictException,
      );
    });

    it('ConflictException — не создаёт пользователя при конфликте', async () => {
      userRepo.findByEmail.mockResolvedValue(makeUser());

      await expect(service.register(makeRegisterDto())).rejects.toThrow();

      expect(userRepo.create).not.toHaveBeenCalled();
    });
  });

  // ─── login ────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('успешный логин — возвращает токены', async () => {
      userRepo.findByEmail.mockResolvedValue(makeUser());
      hashService.compare.mockResolvedValue(true);
      hashService.hash.mockResolvedValue('hashed-refresh');
      tokenService.signAccessToken.mockReturnValue('access-token');
      tokenService.signRefreshToken.mockReturnValue('refresh-token');

      const result = await service.login(makeLoginDto());

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('UnauthorizedException если пользователь не найден', async () => {
      userRepo.findByEmail.mockResolvedValue(null);

      await expect(service.login(makeLoginDto())).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('UnauthorizedException если пароль неверный', async () => {
      userRepo.findByEmail.mockResolvedValue(makeUser());
      hashService.compare.mockResolvedValue(false);

      await expect(service.login(makeLoginDto())).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('login — не раскрывает причину ошибки (нет user vs wrong password)', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      const errorNoUser = await service
        .login(makeLoginDto())
        .catch((e: unknown) => (e instanceof Error ? e.message : String(e)));
      userRepo.findByEmail.mockResolvedValue(makeUser());
      hashService.compare.mockResolvedValue(false);
      const errorBadPass = await service
        .login(makeLoginDto())
        .catch((e: unknown) => (e instanceof Error ? e.message : String(e)));

      // одинаковое сообщение — не раскрываем причину
      expect(errorNoUser).toBe(errorBadPass);
    });

    it('login — сравнивает введённый пароль с хешем из базы', async () => {
      const user = makeUser({ passwordHash: 'stored-hash' });
      userRepo.findByEmail.mockResolvedValue(user);
      hashService.compare.mockResolvedValue(true);
      hashService.hash.mockResolvedValue('h');
      tokenService.signAccessToken.mockReturnValue('a');
      tokenService.signRefreshToken.mockReturnValue('r');

      await service.login(makeLoginDto({ password: 'entered-password' }));

      expect(hashService.compare).toHaveBeenCalledWith(
        'entered-password',
        'stored-hash',
      );
    });
  });

  // ─── refresh ──────────────────────────────────────────────────────────────

  describe('refresh', () => {
    it('успешный refresh — возвращает новые токены', async () => {
      tokenService.verifyRefreshToken.mockReturnValue({ sub: 'user-1' });
      userRepo.findById.mockResolvedValue(
        makeUser({ refreshToken: 'stored-hash' }),
      );
      hashService.compare.mockResolvedValue(true);
      hashService.hash.mockResolvedValue('new-hashed-refresh');
      tokenService.signAccessToken.mockReturnValue('new-access');
      tokenService.signRefreshToken.mockReturnValue('new-refresh');

      const result = await service.refresh('valid-refresh-token');

      expect(result).toEqual({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });
    });

    it('UnauthorizedException если токен невалиден (verify выбрасывает)', async () => {
      tokenService.verifyRefreshToken.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(service.refresh('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('UnauthorizedException если у пользователя нет refreshToken в базе', async () => {
      tokenService.verifyRefreshToken.mockReturnValue({ sub: 'user-1' });
      userRepo.findById.mockResolvedValue(makeUser({ refreshToken: null }));

      await expect(service.refresh('token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('UnauthorizedException если токен не совпадает с сохранённым хешем', async () => {
      tokenService.verifyRefreshToken.mockReturnValue({ sub: 'user-1' });
      userRepo.findById.mockResolvedValue(
        makeUser({ refreshToken: 'hash-of-another-token' }),
      );
      hashService.compare.mockResolvedValue(false);

      await expect(service.refresh('stolen-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('UnauthorizedException если пользователь не найден', async () => {
      tokenService.verifyRefreshToken.mockReturnValue({ sub: 'ghost-user' });
      userRepo.findById.mockResolvedValue(null);

      await expect(service.refresh('token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ─── logout ───────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('logout — обнуляет refreshToken в базе', async () => {
      await service.logout('user-1');

      expect(userRepo.update).toHaveBeenCalledWith('user-1', {
        refreshToken: null,
      });
    });

    it('logout — не выбрасывает исключение', async () => {
      userRepo.update.mockResolvedValue(null);

      await expect(service.logout('user-1')).resolves.not.toThrow();
    });
  });
});
