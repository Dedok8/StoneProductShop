import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { MockProxy } from 'jest-mock-extended';
import { mock } from 'jest-mock-extended';

import { UserService } from '@/model/user/application/user.service';
import { UserEntity } from '@/model/user/domain/entities';
import type { IUserRepository } from '@/model/user/domain/interfaces';
import type { HashService } from '@/shared';
import { UserRole } from '@/shared/guards/role/user-role';

const makeUser = (overrides: Partial<UserEntity> = {}): UserEntity =>
  new UserEntity({
    id: 'user-1',
    name: 'John Stone',
    email: 'john@example.com',
    passwordHash: 'hashed-old-password',
    role: UserRole.USER,
    refreshToken: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  });

describe('UserService', () => {
  let service: UserService;
  let repository: MockProxy<IUserRepository>;
  let hashService: MockProxy<HashService>;

  beforeEach(() => {
    repository = mock<IUserRepository>();
    hashService = mock<HashService>();
    service = new UserService(repository, hashService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('findById', () => {
    it('возвращает замапленного пользователя, если он найден', async () => {
      repository.findById.mockResolvedValue(makeUser());

      const result = await service.findById('user-1');

      expect(result).toEqual(
        expect.objectContaining({
          id: 'user-1',
          name: 'John Stone',
          email: 'john@example.com',
          role: UserRole.USER,
        }),
      );
      expect(result.createdAt).toBeInstanceOf(Date);

      expect(result).not.toHaveProperty('passwordHash');
    });

    it('выбрасывает NotFoundException, если пользователь не найден', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('возвращает пользователя по email', async () => {
      repository.findByEmail.mockResolvedValue(makeUser());

      const result = await service.findByEmail('john@example.com');

      expect(result.email).toBe('john@example.com');
    });

    it('выбрасывает NotFoundException, если email не найден', async () => {
      repository.findByEmail.mockResolvedValue(null);

      await expect(service.findByEmail('unknown@example.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('возвращает пагинированный список пользователей', async () => {
      repository.findAll.mockResolvedValue({
        items: [makeUser(), makeUser({ id: 'user-2' })],
        total: 2,
      });

      const result = await service.findAll({
        page: 1,
        limit: 20,
      });

      expect(result.items).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });
  });

  describe('create', () => {
    const dto = {
      name: 'New User',
      email: 'new@example.com',
      password: 'Password123!',
    };

    it('создаёт пользователя с захэшированным паролем, если email свободен', async () => {
      repository.findByEmail.mockResolvedValue(null);
      hashService.hash.mockResolvedValue('hashed-password');
      repository.create.mockResolvedValue(makeUser({ email: dto.email }));

      const result = await service.create(dto);

      expect(hashService.hash).toHaveBeenCalledWith(dto.password);
      expect(repository.create).toHaveBeenCalledWith({
        name: dto.name,
        email: dto.email,
        passwordHash: 'hashed-password',
        role: undefined,
      });
      expect(result.email).toBe(dto.email);
    });

    it('выбрасывает ConflictException, если email уже занят', async () => {
      repository.findByEmail.mockResolvedValue(makeUser());

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(repository.create).not.toHaveBeenCalled();
      expect(hashService.hash).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('обновляет пользователя', async () => {
      repository.update.mockResolvedValue(makeUser({ name: 'Updated' }));

      const result = await service.update('user-1', { name: 'Updated' });

      expect(repository.update).toHaveBeenCalledWith('user-1', {
        name: 'Updated',
      });
      expect(result.name).toBe('Updated');
    });

    it('выбрасывает NotFoundException, если пользователь для обновления не найден', async () => {
      repository.update.mockResolvedValue(null);

      await expect(service.update('missing', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateRole', () => {
    it('обновляет роль пользователя', async () => {
      repository.updateRole.mockResolvedValue(
        makeUser({ role: UserRole.ADMIN }),
      );

      const result = await service.updateRole('user-1', {
        role: UserRole.ADMIN,
      });

      expect(repository.updateRole).toHaveBeenCalledWith(
        'user-1',
        UserRole.ADMIN,
      );
      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('выбрасывает NotFoundException, если пользователь не найден', async () => {
      repository.updateRole.mockResolvedValue(null);

      await expect(
        service.updateRole('missing', { role: UserRole.ADMIN }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('удаляет пользователя, если он существует', async () => {
      repository.findById.mockResolvedValue(makeUser());

      await service.delete('user-1');

      expect(repository.delete).toHaveBeenCalledWith('user-1');
    });

    it('выбрасывает NotFoundException и не вызывает delete, если пользователь не найден', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    const dto = {
      currentPassword: 'OldPassword123',
      newPassword: 'NewPassword456',
    };

    it('меняет пароль и сбрасывает refreshToken, если текущий пароль верный', async () => {
      repository.findById.mockResolvedValue(makeUser());
      hashService.compare.mockResolvedValue(true);
      hashService.hash.mockResolvedValue('hashed-new-password');

      await service.changePassword('user-1', dto);

      expect(hashService.compare).toHaveBeenCalledWith(
        dto.currentPassword,
        'hashed-old-password',
      );
      expect(hashService.hash).toHaveBeenCalledWith(dto.newPassword);
      expect(repository.update).toHaveBeenCalledWith('user-1', {
        passwordHash: 'hashed-new-password',
        refreshToken: null,
      });
    });

    it('выбрасывает NotFoundException, если пользователь не найден', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.changePassword('missing', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('выбрасывает UnauthorizedException, если текущий пароль неверный', async () => {
      repository.findById.mockResolvedValue(makeUser());
      hashService.compare.mockResolvedValue(false);

      await expect(service.changePassword('user-1', dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('выбрасывает BadRequestException, если новый пароль совпадает со старым (по значению DTO)', async () => {
      repository.findById.mockResolvedValue(makeUser());
      hashService.compare.mockResolvedValue(true);

      await expect(
        service.changePassword('user-1', {
          currentPassword: 'SamePassword123',
          newPassword: 'SamePassword123',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });
});
