import { UserRepository, UserRole } from '@modules/user/domain';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { UserService } from './user.service';

// ─── Фабрика ──────────────────────────────────────────────────────────────

const makeUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'test@test.com',
  passwordHash: 'hashed-password',
  role: UserRole.USER,
  refreshToken: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// ─── Тесты ────────────────────────────────────────────────────────────────

describe('UserService', () => {
  let service: UserService;

  const repo: jest.Mocked<
    Pick<UserRepository, 'findById' | 'findAll' | 'update' | 'delete'>
  > = {
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserService, { provide: UserRepository, useValue: repo }],
    }).compile();

    service = module.get(UserService);
    jest.clearAllMocks();
  });

  // ─── getUser ──────────────────────────────────────────────────────────────

  describe('getUser', () => {
    it('возвращает пользователя по id', async () => {
      repo.findById.mockResolvedValue(makeUser());

      const result = await service.getUser('user-1');

      expect(result.id).toBe('user-1');
      expect(result.email).toBe('test@test.com');
    });

    it('НЕ возвращает passwordHash в ответе — security!', async () => {
      repo.findById.mockResolvedValue(makeUser());

      const result = await service.getUser('user-1');

      expect(result).not.toHaveProperty('passwordHash');
    });

    it('НЕ возвращает refreshToken в ответе — security!', async () => {
      repo.findById.mockResolvedValue(makeUser({ refreshToken: 'some-token' }));

      const result = await service.getUser('user-1');

      expect(result).not.toHaveProperty('refreshToken');
    });

    it('NotFoundException если пользователь не найден', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.getUser('ghost')).rejects.toThrow(NotFoundException);
    });

    it('вызывает репозиторий с правильным id', async () => {
      repo.findById.mockResolvedValue(makeUser());

      await service.getUser('user-1');

      expect(repo.findById).toHaveBeenCalledWith('user-1');
    });
  });

  // ─── getAllUsers ───────────────────────────────────────────────────────────

  describe('getAllUsers', () => {
    it('возвращает список пользователей', async () => {
      repo.findAll.mockResolvedValue([
        makeUser(),
        makeUser({ id: 'user-2', email: 'b@b.com' }),
      ]);

      const result = await service.getAllUsers();

      expect(result).toHaveLength(2);
    });

    it('маппит каждого пользователя через UserMapper — нет passwordHash', async () => {
      repo.findAll.mockResolvedValue([
        makeUser(),
        makeUser({ id: 'user-2', email: 'b@b.com' }),
      ]);

      const result = await service.getAllUsers();

      result.forEach((user) => {
        expect(user).not.toHaveProperty('passwordHash');
        expect(user).not.toHaveProperty('refreshToken');
      });
    });

    it('возвращает пустой массив если пользователей нет', async () => {
      repo.findAll.mockResolvedValue([]);

      const result = await service.getAllUsers();

      expect(result).toEqual([]);
    });
  });

  // ─── updateUser ───────────────────────────────────────────────────────────

  describe('updateUser', () => {
    it('успешно обновляет пользователя', async () => {
      const updated = makeUser({ email: 'new@email.com' });
      repo.update.mockResolvedValue(updated);

      const result = await service.updateUser('user-1', {
        email: 'new@email.com',
      });

      expect(result.email).toBe('new@email.com');
    });

    it('вызывает репозиторий update с правильными аргументами', async () => {
      repo.update.mockResolvedValue(makeUser());

      await service.updateUser('user-1', { email: 'new@email.com' });

      expect(repo.update).toHaveBeenCalledWith('user-1', {
        email: 'new@email.com',
      });
    });

    it('NotFoundException если update вернул null', async () => {
      repo.update.mockResolvedValue(null);

      await expect(
        service.updateUser('ghost', { email: 'x@x.com' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('НЕ возвращает passwordHash после обновления', async () => {
      repo.update.mockResolvedValue(makeUser());

      const result = await service.updateUser('user-1', {
        email: 'new@email.com',
      });

      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  // ─── deleteUser ───────────────────────────────────────────────────────────

  describe('deleteUser', () => {
    it('успешно удаляет пользователя', async () => {
      repo.findById.mockResolvedValue(makeUser());
      repo.delete.mockResolvedValue(undefined);

      await expect(service.deleteUser('user-1')).resolves.not.toThrow();
    });

    it('вызывает delete с правильным id', async () => {
      repo.findById.mockResolvedValue(makeUser());

      await service.deleteUser('user-1');

      expect(repo.delete).toHaveBeenCalledWith('user-1');
    });

    it('NotFoundException если пользователь не найден перед удалением', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.deleteUser('ghost')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('НЕ вызывает delete если пользователь не найден', async () => {
      repo.findById.mockResolvedValue(null);

      await service.deleteUser('ghost').catch(() => {});

      expect(repo.delete).not.toHaveBeenCalled();
    });
  });
});
