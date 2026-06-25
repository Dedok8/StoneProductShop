import { ProductQueryDto } from '@modules/product/application/dto';
import type { CreateProductDto } from '@modules/product/application/dto';
import { ProductCacheService } from '@modules/product/application/product-cache.service';
import { ProductService } from '@modules/product/application/product.service';
import { PRODUCT_REPOSITORY, ProductEntity } from '@modules/product/domain';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';

jest.mock('crypto', () => ({
  randomUUID: () => 'mocked-uuid-12345',
}));

describe('ProductService', () => {
  let service: ProductService;

  const productRepo = {
    findBySlug: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    decrementStock: jest.fn(),
  };

  const cache = {
    getDetail: jest.fn(),
    setDetail: jest.fn(),
    getList: jest.fn(),
    setList: jest.fn(),
    invalidateDetail: jest.fn(),
  };

  const createProductDto = (
    overrides: Partial<CreateProductDto> = {},
  ): CreateProductDto => ({
    name: 'White Carrara Marble Slab',
    description: 'Premium Italian marble, polished finish',
    price: 149.99,
    stock: 10,
    categoryId: 'category-1',
    images: [],
    ...overrides,
  });

  const createProductEntity = (
    overrides: Partial<ProductEntity> = {},
  ): ProductEntity =>
    new ProductEntity({
      id: 'prod-1',
      name: 'White Carrara Marble Slab',
      slug: 'white-carrara-marble-slab-mocked-u',
      description: 'Premium Italian marble, polished finish',
      price: 149.99,
      stock: 10,
      images: [],
      categoryId: 'category-1',
      ownerId: 'user-1',
      isActive: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      ...overrides,
    });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PRODUCT_REPOSITORY, useValue: productRepo },
        { provide: ProductCacheService, useValue: cache },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a product when the generated slug is unique', async () => {
      const dto = createProductDto();
      const ownerId = 'user-1';
      const product = createProductEntity({ ...dto, ownerId });

      productRepo.findBySlug.mockResolvedValue(null);
      productRepo.create.mockResolvedValue(product);

      const result = await service.create(dto, ownerId);

      expect(productRepo.findBySlug).toHaveBeenCalledWith(
        'white-carrara-marble-slab-mocked-u',
      );
      expect(productRepo.create).toHaveBeenCalledWith({
        ...dto,
        slug: 'white-carrara-marble-slab-mocked-u',
        ownerId,
      });
      expect(result).toBe(product);
    });

    it('throws ConflictException when the generated slug already exists', async () => {
      productRepo.findBySlug.mockResolvedValue(createProductEntity());

      await expect(
        service.create(createProductDto({ name: 'Stone' }), 'user-1'),
      ).rejects.toThrow(ConflictException);

      expect(productRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('returns a product from cache when it exists', async () => {
      const cachedProduct = createProductEntity();
      cache.getDetail.mockResolvedValue(cachedProduct);

      const result = await service.findById('prod-1');

      expect(result).toBe(cachedProduct);
      expect(cache.getDetail).toHaveBeenCalledWith('prod-1');
      expect(productRepo.findById).not.toHaveBeenCalled();
    });

    it('loads a product from repository and stores it in cache on cache miss', async () => {
      const dbProduct = createProductEntity();
      cache.getDetail.mockResolvedValue(null);
      productRepo.findById.mockResolvedValue(dbProduct);

      const result = await service.findById('prod-1');

      expect(result).toBe(dbProduct);
      expect(productRepo.findById).toHaveBeenCalledWith('prod-1');
      expect(cache.setDetail).toHaveBeenCalledWith('prod-1', dbProduct);
    });

    it('throws NotFoundException when the product does not exist', async () => {
      cache.getDetail.mockResolvedValue(null);
      productRepo.findById.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findMany', () => {
    it('returns cached list results with the requested pagination metadata', async () => {
      const query = Object.assign(new ProductQueryDto(), {
        categoryId: 'category-1',
        ownerId: 'user-1',
        page: 2,
        limit: 5,
      });
      const cached = { items: [createProductEntity()], total: 1 };

      cache.getList.mockResolvedValue(cached);

      const result = await service.findMany(query);

      expect(result).toEqual({ ...cached, page: 2, limit: 5 });
      expect(cache.getList).toHaveBeenCalledWith({
        categoryId: 'category-1',
        ownerId: 'user-1',
        page: 2,
        limit: 5,
      });
      expect(productRepo.findMany).not.toHaveBeenCalled();
    });

    it('loads list results from repository and caches them on cache miss', async () => {
      const query = Object.assign(new ProductQueryDto(), {
        page: 2,
        limit: 5,
        isActive: false,
      });
      const products = { items: [createProductEntity()], total: 1 };

      cache.getList.mockResolvedValue(null);
      productRepo.findMany.mockResolvedValue(products);

      const result = await service.findMany(query);

      expect(productRepo.findMany).toHaveBeenCalledWith({
        categoryId: undefined,
        ownerId: undefined,
        isActive: false,
        skip: 5,
        take: 5,
      });
      expect(cache.setList).toHaveBeenCalledWith(
        {
          categoryId: undefined,
          ownerId: undefined,
          page: 2,
          limit: 5,
        },
        products,
      );
      expect(result).toEqual({ ...products, page: 2, limit: 5 });
    });
  });

  describe('update', () => {
    const requester = { userId: 'user-1', role: 'USER' };

    it('updates a product and invalidates cache when requester is the owner', async () => {
      const product = createProductEntity({ ownerId: 'user-1' });
      const updatedProduct = createProductEntity({ name: 'New Name' });

      productRepo.findById.mockResolvedValue(product);
      productRepo.update.mockResolvedValue(updatedProduct);

      const result = await service.update(
        'prod-1',
        { name: 'New Name' },
        requester,
      );

      expect(productRepo.update).toHaveBeenCalledWith('prod-1', {
        name: 'New Name',
        slug: 'new-name-mocked-u',
      });
      expect(cache.invalidateDetail).toHaveBeenCalledWith('prod-1');
      expect(result).toBe(updatedProduct);
    });

    it('allows an admin to update a product owned by another user', async () => {
      const product = createProductEntity({ ownerId: 'user-2' });
      const adminRequester = { userId: 'admin-id', role: 'ADMIN' };

      productRepo.findById.mockResolvedValue(product);
      productRepo.update.mockResolvedValue(product);

      await expect(
        service.update('prod-1', { name: 'New' }, adminRequester),
      ).resolves.toBe(product);
    });

    it('throws ForbiddenException when requester is neither owner nor admin', async () => {
      const product = createProductEntity({ ownerId: 'user-2' });
      productRepo.findById.mockResolvedValue(product);

      await expect(
        service.update('prod-1', { name: 'Hack' }, requester),
      ).rejects.toThrow(ForbiddenException);

      expect(productRepo.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when product does not exist', async () => {
      productRepo.findById.mockResolvedValue(null);

      await expect(
        service.update('missing', { name: 'New' }, requester),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('deletes a product and invalidates cache when requester can modify it', async () => {
      const product = createProductEntity({ ownerId: 'user-1' });
      productRepo.findById.mockResolvedValue(product);
      productRepo.delete.mockResolvedValue(undefined);

      await service.delete('prod-1', { userId: 'user-1', role: 'USER' });

      expect(productRepo.delete).toHaveBeenCalledWith('prod-1');
      expect(cache.invalidateDetail).toHaveBeenCalledWith('prod-1');
    });

    it('throws NotFoundException when product does not exist', async () => {
      productRepo.findById.mockResolvedValue(null);

      await expect(
        service.delete('missing', { userId: 'user-1', role: 'USER' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
