import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { MockProxy } from 'jest-mock-extended';
import { mock } from 'jest-mock-extended';

import type { UserQueryDto } from '@/model/user/application/dto';
import { UserService } from '@/model/user/application/user.service';
import type { IUserRepository } from '@/model/user/domain';
import type { UserRepository } from '@/model/user/infrastructure';
import { makeUser, UserRole, type HashService } from '@/shared';

describe('userService', () => {
  let service: UserService;
  let repository: MockProxy<IUserRepository>;
  let hashService: MockProxy<HashService>;

  beforeEach(() => {
    repository = mock<UserRepository>();
    hashService = mock<HashService>();
    service = new UserService(repository, hashService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('findById', () => {
    it('returns the mapped user, if found', async () => {
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

    it('throws a NotFoundException if the user is not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('returns the user via email', async () => {
      repository.findByEmail.mockResolvedValue(makeUser());

      const result = await service.findByEmail('Ivan@example.com');

      expect(result.email).toBe('Ivan@example.com');
    });

    it('throws a NotFoundException if the email is not found', async () => {
      repository.findByEmail.mockResolvedValue(null);

      await expect(service.findByEmail('unknown@example.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('returns a paginated list of users', async () => {
      repository.findAll.mockResolvedValue({
        items: [makeUser(), makeUser({ id: 'user-2' })],
        total: 2,
      });
      const query: UserQueryDto = { page: 1, limit: 20 };

      const result = await service.findAll(query);

      expect(repository.findAll).toHaveBeenCalledWith(query);
      expect(result.items).toHaveLength(2);
      expect(result.meta).toEqual(
        expect.objectContaining({
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        }),
      );
    });

    it('sets the default page/limit values if the query does not include them', async () => {
      repository.findAll.mockResolvedValue({ items: [], total: 0 });

      const result = await service.findAll({});

      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
      expect(result.items).toEqual([]);
    });
  });

  describe('create', () => {
    const dto = {
      name: 'new user',
      email: 'new@example.com',
      password: '!Password123',
    };

    it('creates a user with a hashed password if the email address is available', async () => {
      repository.findByEmail.mockResolvedValue(null);
      hashService.hash.mockResolvedValue('hashed-password');
      repository.create.mockResolvedValue(makeUser({ email: dto.email }));

      const result = await service.create(dto);

      expect(hashService.hash).toHaveBeenCalledWith(dto.password);
      expect(repository.create).toHaveBeenCalledWith({
        name: dto.name,
        email: dto.email,
        passwordHash: 'hashed-password',
        role: UserRole.USER,
      });
      expect(result.email).toBe(dto.email);
    });

    it('throws a ConflictException if the email address is already taken', async () => {
      repository.findByEmail.mockResolvedValue(makeUser());

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(repository.create).not.toHaveBeenCalled();
      expect(hashService.hash).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates the user', async () => {
      repository.update.mockResolvedValue(makeUser({ name: 'Updated' }));

      const result = await service.update('user-1', { name: 'Updated' });

      expect(repository.update).toHaveBeenCalledWith('user-1', {
        name: 'Updated',
      });
      expect(result.name).toBe('Updated');
    });

    it('throws a NotFoundException if the user to be updated is not found', async () => {
      repository.update.mockResolvedValue(null);

      await expect(service.update('missing', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateRole', () => {
    it('updates the users role', async () => {
      repository.updateRole.mockResolvedValue(
        makeUser({ role: UserRole.ADMIN }),
      );

      const result = await service.updateRole('user-1', {
        role: UserRole.ADMIN,
      });

      expect(repository.updateRole).toHaveBeenCalledWith('user-1', {
        role: UserRole.ADMIN,
      });
      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('throws a NotFoundException if the user is not found', async () => {
      repository.updateRole.mockResolvedValue(null);

      await expect(
        service.updateRole('missing', { role: UserRole.ADMIN }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('deletes the user if they exist', async () => {
      repository.findById.mockResolvedValue(makeUser());

      await service.delete('user-1');

      expect(repository.delete).toHaveBeenCalledWith('user-1');
    });

    it('throws a NotFoundException and does not call `delete` if the user is not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    const dto = {
      currentPassword: '!OldPassword123',
      newPassword: '!NewPassword456',
    };

    it('changes the password and resets the refreshToken if the current password is correct', async () => {
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

    it('throws a NotFoundException if the user is not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.changePassword('missing', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws an UnauthorizedException if the current password is incorrect', async () => {
      repository.findById.mockResolvedValue(makeUser());
      hashService.compare.mockResolvedValue(false);

      await expect(service.changePassword('user-1', dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('Throws a BadRequestException if the new password matches the old one (based on the DTO value)', async () => {
      repository.findById.mockResolvedValue(makeUser());
      hashService.compare.mockResolvedValue(true);

      await expect(
        service.changePassword('user-1', {
          currentPassword: '!SamePassword123',
          newPassword: '!SamePassword123',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });
});
