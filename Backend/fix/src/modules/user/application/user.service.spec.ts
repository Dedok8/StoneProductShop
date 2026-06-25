import { UserService } from '@modules/user/application/user.service';
import { UserRepository } from '@modules/user/domain';
import { UserRole } from '@modules/user/domain/user-role.enum';
import { NotFoundException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

// ─── Фабрика ──────────────────────────────────────────────────────────────

const makeUserEntity = (overrides = {}) => ({
  id: 'uuid-1',
  email: 'test@test.com',
  passwordHash: '$2b$10$hashed',
  role: UserRole.USER,
  refreshToken: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// ─── Тесты ────────────────────────────────────────────────────────────────

describe('UserService', () => {
  let service: UserService;

  // ✅ Мокируем именно UserRepository, а не PrismaService
  const mockUserRepo = {
    findById: jest.fn(),
    findAll: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  // ─── findById ─────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('должен вернуть mapped DTO по id', async () => {
      mockUserRepo.findById.mockResolvedValue(makeUserEntity());

      const result = await service.findById('uuid-1');

      // UserMapper.toResponse убирает passwordHash и refreshToken
      expect(result.id).toBe('uuid-1');
      expect(result.email).toBe('test@test.com');
      expect(result.role).toBe(UserRole.USER);
      expect(result).not.toHaveProperty('passwordHash'); // ⚠️ security
      expect(result).not.toHaveProperty('refreshToken'); // ⚠️ security
    });

    it('должен выбросить NotFoundException если пользователь не найден', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(service.findById('ghost-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('должен вызвать repo.findById с правильным id', async () => {
      mockUserRepo.findById.mockResolvedValue(makeUserEntity());

      await service.findById('uuid-1');

      expect(mockUserRepo.findById).toHaveBeenCalledWith('uuid-1');
    });
  });

  // ─── getAllUsers ───────────────────────────────────────────────────────────

  describe('getAllUsers', () => {
    it('должен вернуть массив mapped DTO', async () => {
      mockUserRepo.findAll.mockResolvedValue([
        makeUserEntity({ id: 'uuid-1' }),
        makeUserEntity({ id: 'uuid-2', email: 'b@b.com' }),
      ]);

      const result = await service.getAllUsers();

      expect(result).toHaveLength(2);
      // Убеждаемся, что passwordHash не утёк ни в одном элементе
      result.forEach((u) => {
        expect(u).not.toHaveProperty('passwordHash');
        expect(u).not.toHaveProperty('refreshToken');
      });
    });

    it('должен вернуть пустой массив если пользователей нет', async () => {
      mockUserRepo.findAll.mockResolvedValue([]);

      const result = await service.getAllUsers();

      expect(result).toEqual([]);
    });
  });

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    it('должен обновить пользователя и вернуть DTO', async () => {
      // ✅ update() вызывает repo.update, который возвращает обновлённую entity
      mockUserRepo.update.mockResolvedValue(
        makeUserEntity({ email: 'new@test.com' }),
      );

      const result = await service.update('uuid-1', { email: 'new@test.com' });

      expect(result.email).toBe('new@test.com');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('должен выбросить NotFoundException если repo.update вернул null', async () => {
      mockUserRepo.update.mockResolvedValue(null);

      await expect(
        service.update('ghost-id', { email: 'x@x.com' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── delete ───────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('должен удалить пользователя', async () => {
      mockUserRepo.findById.mockResolvedValue(makeUserEntity());
      mockUserRepo.delete.mockResolvedValue(undefined);

      await expect(service.delete('uuid-1')).resolves.not.toThrow();

      expect(mockUserRepo.delete).toHaveBeenCalledWith('uuid-1');
    });

    it('должен выбросить NotFoundException если пользователь не найден', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(service.delete('ghost-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('не должен вызывать delete если findById вернул null', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await service.delete('ghost-id').catch(() => {});

      expect(mockUserRepo.delete).not.toHaveBeenCalled();
    });
  });
});
