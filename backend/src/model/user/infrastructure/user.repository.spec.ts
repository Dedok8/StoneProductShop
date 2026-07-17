import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { UserRepository } from './user.repository';

import { PrismaService, RedisCacheService } from '@/shared';
import { UserRole } from '@/shared/guards';

describe('UserRepository', () => {
  let repository: UserRepository;

  const prisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const cache = {
    getJson: jest.fn(),
    setJson: jest.fn(),
    deleteByPattern: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        { provide: PrismaService, useValue: prisma },
        { provide: RedisCacheService, useValue: cache },
      ],
    }).compile();

    repository = module.get(UserRepository);
  });

  describe('findById', () => {
    it('should strip refresh token before caching', async () => {
      cache.getJson.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        name: 'Ivan',
        refreshToken: 'some-token',
      });

      await repository.findById('1');

      const [, cachedValue] = cache.setJson.mock.calls[0] as [
        string,
        { refreshToken?: string },
      ];
      expect(cachedValue.refreshToken).toBeUndefined();
    });

    it('should reattach null refresh token when returning from cache', async () => {
      cache.getJson.mockResolvedValue({
        id: '1',
        name: 'Ivan',
      });

      const result = await repository.findById('1');

      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(result?.refreshToken).toBeNull();
    });

    it('should return null', async () => {
      cache.getJson.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(null);

      expect(await repository.findById('100')).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return user', async () => {
      cache.getJson.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'ivan@example.com',
      });

      const result = await repository.findByEmail('ivan@example.com');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'ivan@example.com' },
      });
      expect(result?.email).toBe('ivan@example.com');
    });
  });

  describe('findAll', () => {
    it('should load users from db and search across name/email', async () => {
      cache.getJson.mockResolvedValue(null);
      prisma.user.findMany.mockResolvedValue([{ id: '1', name: 'Ivan' }]);
      prisma.user.count.mockResolvedValue(1);

      const result = await repository.findAll({ search: 'ivan' });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { name: { contains: 'ivan', mode: 'insensitive' } },
              { email: { contains: 'ivan', mode: 'insensitive' } },
            ],
          },
        }),
      );
      expect(result.total).toBe(1);
    });

    it('should return cached users', async () => {
      cache.getJson.mockResolvedValue({
        items: [{ id: '1', name: 'Ivan' }],
        total: 1,
      });

      const result = await repository.findAll({});

      expect(prisma.user.findMany).not.toHaveBeenCalled();
      expect(result.items).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('should create user', async () => {
      prisma.user.create.mockResolvedValue({
        id: '1',
        email: 'ivan@example.com',
      });

      const result = await repository.create({
        name: 'Ivan',
        email: 'ivan@example.com',
        passwordHash: 'hashed',
      });

      expect(cache.deleteByPattern).toHaveBeenCalledWith('user:id:1');
      expect(cache.deleteByPattern).toHaveBeenCalledWith(
        'user:email:ivan@example.com',
      );
      expect(cache.deleteByPattern).toHaveBeenCalledWith('user:list:*');
      expect(result.email).toBe('ivan@example.com');
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      prisma.user.update.mockResolvedValue({ id: '1', name: 'Updated' });

      const result = await repository.update('1', { name: 'Updated' });

      expect(result?.name).toBe('Updated');
      expect(cache.deleteByPattern).toHaveBeenCalledWith('user:list:*');
    });
  });

  describe('updateRole', () => {
    it('should update role', async () => {
      prisma.user.update.mockResolvedValue({ id: '1', role: UserRole.ADMIN });

      const result = await repository.updateRole('1', UserRole.ADMIN);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { role: UserRole.ADMIN },
      });
      expect(result?.role).toBe(UserRole.ADMIN);
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      prisma.user.delete.mockResolvedValue({ id: '1' });

      await repository.delete('1');

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(cache.deleteByPattern).toHaveBeenCalledWith('user:id:1');
      expect(cache.deleteByPattern).toHaveBeenCalledWith('user:list:*');
    });
  });
});
