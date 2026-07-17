import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { ProductRepository } from './product.repository';

import { PrismaService, RedisCacheService } from '@/shared';

describe('ProductRepository', () => {
  let repository: ProductRepository;

  const prisma = {
    product: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
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
        ProductRepository,
        { provide: PrismaService, useValue: prisma },
        { provide: RedisCacheService, useValue: cache },
      ],
    }).compile();

    repository = module.get(ProductRepository);
  });

  describe('findById', () => {
    it('should return product on cache miss and populate cache', async () => {
      cache.getJson.mockResolvedValue(null);
      prisma.product.findUnique.mockResolvedValue({
        id: '1',
        name: 'Granite Slab',
        slug: 'granite-slab',
        price: { toNumber: () => 999 },
      });

      const result = await repository.findById('1');

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(cache.setJson).toHaveBeenCalled();
      expect(result?.price).toBe(999);
    });

    it('should return cached product', async () => {
      cache.getJson.mockResolvedValue({
        id: '1',
        name: 'Granite Slab',
        price: 999,
      });

      const result = await repository.findById('1');

      expect(prisma.product.findUnique).not.toHaveBeenCalled();
      expect(result?.id).toBe('1');
    });

    it('should return null', async () => {
      cache.getJson.mockResolvedValue(null);
      prisma.product.findUnique.mockResolvedValue(null);

      const result = await repository.findById('100');

      expect(result).toBeNull();
      expect(cache.setJson).not.toHaveBeenCalled();
    });
  });

  describe('findBySlug', () => {
    it('should return product', async () => {
      cache.getJson.mockResolvedValue(null);
      prisma.product.findUnique.mockResolvedValue({
        id: '1',
        slug: 'granite-slab',
      });

      const result = await repository.findBySlug('granite-slab');

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { slug: 'granite-slab' },
      });
      expect(result?.slug).toBe('granite-slab');
    });
  });

  describe('findByName', () => {
    it('should return product', async () => {
      prisma.product.findFirst.mockResolvedValue({
        id: '1',
        name: 'Granite Slab',
      });

      const result = await repository.findByName('Granite Slab');

      expect(result?.name).toBe('Granite Slab');
    });

    it('should return null', async () => {
      prisma.product.findFirst.mockResolvedValue(null);

      expect(await repository.findByName('Nothing')).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return cached products', async () => {
      cache.getJson.mockResolvedValue({
        items: [{ id: '1', name: 'Granite Slab' }],
        total: 1,
      });

      const result = await repository.findAll({});

      expect(prisma.product.findMany).not.toHaveBeenCalled();
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it('should load products from db and cache them', async () => {
      cache.getJson.mockResolvedValue(null);
      prisma.product.findMany.mockResolvedValue([
        { id: '1', name: 'Granite Slab' },
      ]);
      prisma.product.count.mockResolvedValue(1);

      const result = await repository.findAll({
        search: 'granite',
        page: 1,
        limit: 20,
      });

      expect(prisma.product.findMany).toHaveBeenCalled();
      expect(cache.setJson).toHaveBeenCalled();
      expect(result.total).toBe(1);
    });
  });

  describe('create', () => {
    it('should create product', async () => {
      prisma.product.create.mockResolvedValue({
        id: '1',
        name: 'Granite Slab',
        slug: 'granite-slab',
      });

      const result = await repository.create({
        name: 'Granite Slab',
        slug: 'granite-slab',
        price: 999,
        stock: 10,
        images: [],
        categoryId: '2',
        ownerId: '3',
      });

      expect(prisma.product.create).toHaveBeenCalled();
      expect(cache.deleteByPattern).toHaveBeenCalledWith('product:id:1');
      expect(cache.deleteByPattern).toHaveBeenCalledWith(
        'product:slug:granite-slab',
      );
      expect(cache.deleteByPattern).toHaveBeenCalledWith('product:list*');
      expect(result.name).toBe('Granite Slab');
    });
  });

  describe('update', () => {
    it('should update product', async () => {
      prisma.product.update.mockResolvedValue({
        id: '1',
        name: 'Updated Slab',
      });

      const result = await repository.update('1', {
        name: 'Updated Slab',
      });

      expect(cache.deleteByPattern).toHaveBeenCalledWith('product:list*');
      expect(result?.name).toBe('Updated Slab');
    });
  });

  describe('delete', () => {
    it('should delete product', async () => {
      prisma.product.delete.mockResolvedValue({
        id: '1',
        name: 'Granite Slab',
      });

      await repository.delete('1');

      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(cache.deleteByPattern).toHaveBeenCalledWith('product:id:1');
      expect(cache.deleteByPattern).toHaveBeenCalledWith('product:list*');
    });
  });
});
