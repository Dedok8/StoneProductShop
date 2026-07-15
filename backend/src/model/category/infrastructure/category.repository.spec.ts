import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { CategoryRepository } from './category.repository';

import { PrismaService, RedisCacheService } from '@/shared';

describe('CategoryRepository', () => {
  let repository: CategoryRepository;

  const prisma = {
    category: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const cache = {
    getJson: jest.fn(),
    setJson: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryRepository,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: RedisCacheService,
          useValue: cache,
        },
      ],
    }).compile();

    repository = module.get(CategoryRepository);
  });

  describe('findById', () => {
    it('should return category', async () => {
      prisma.category.findUnique.mockResolvedValue({
        id: '1',
        name: 'Granite',
        slug: 'granite',
      });

      const result = await repository.findById('1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('1');
    });

    it('should return null', async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      const result = await repository.findById('100');

      expect(result).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('should return category', async () => {
      prisma.category.findUnique.mockResolvedValue({
        id: '1',
        name: 'Granite',
        slug: 'granite',
      });

      const result = await repository.findBySlug('granite');

      expect(result?.slug).toBe('granite');
    });
  });

  describe('findByName', () => {
    it('should return category', async () => {
      prisma.category.findUnique.mockResolvedValue({
        id: '1',
        name: 'Granite',
        slug: 'granite',
      });

      const result = await repository.findByName('Granite');

      expect(result?.name).toBe('Granite');
    });

    it('should return null', async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      expect(await repository.findByName('Test')).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return cached categories', async () => {
      cache.getJson.mockResolvedValue([
        {
          id: '1',
          name: 'Granite',
          slug: 'granite',
        },
      ]);

      const result = await repository.findAll();

      expect(cache.getJson).toHaveBeenCalled();
      expect(prisma.category.findMany).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should load categories from db', async () => {
      cache.getJson.mockResolvedValue(null);

      prisma.category.findMany.mockResolvedValue([
        {
          id: '1',
          name: 'Granite',
          slug: 'granite',
        },
      ]);

      const result = await repository.findAll();

      expect(prisma.category.findMany).toHaveBeenCalled();
      expect(cache.setJson).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('should create category', async () => {
      prisma.category.create.mockResolvedValue({
        id: '1',
        name: 'Granite',
        slug: 'granite',
      });

      const result = await repository.create({
        name: 'Granite',
        slug: 'granite',
      });

      expect(prisma.category.create).toHaveBeenCalled();

      expect(result.name).toBe('Granite');
    });
  });

  describe('update', () => {
    it('should update category', async () => {
      prisma.category.update.mockResolvedValue({
        id: '1',
        name: 'Updated',
        slug: 'updated',
      });

      const result = await repository.update('1', {
        name: 'Updated',
      });

      expect(prisma.category.update).toHaveBeenCalled();

      expect(result?.name).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should delete category', async () => {
      prisma.category.delete.mockResolvedValue({
        id: '1',
        name: 'Granite',
        slug: 'granite',
      });

      await repository.delete('1');

      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
