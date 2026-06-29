import { ProductEntity } from '@modules/product/domain/entities';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { RedisCacheService } from '@shared/redis';

import { ProductCacheService } from './product-cache.service';

const makeProductEntity = (
  overrides: Partial<ConstructorParameters<typeof ProductEntity>[0]> = {},
): ProductEntity =>
  new ProductEntity({
    id: 'prod-1',
    name: 'White Carrara Marble',
    slug: 'white-carrara-marble-abc12345',
    description: 'Premium marble',
    price: 149.99,
    stock: 10,
    images: [],
    categoryId: 'cat-1',
    ownerId: 'user-1',
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  });

describe('ProductCacheService', () => {
  let service: ProductCacheService;

  const cache = {
    getJson: jest.fn(),
    setJson: jest.fn(),
    delete: jest.fn(),
    deleteByPattern: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductCacheService,
        { provide: RedisCacheService, useValue: cache },
      ],
    }).compile();

    service = module.get(ProductCacheService);
    jest.clearAllMocks();
  });

  describe('getDetail', () => {
    it('возвращает продукт из кеша (cache hit)', async () => {
      const product = makeProductEntity();
      cache.getJson.mockResolvedValue(product);

      const result = await service.getDetail('prod-1');

      expect(cache.getJson).toHaveBeenCalledWith('product:detail:prod-1');
      expect(result).toBe(product);
    });

    it('возвращает null при cache miss', async () => {
      cache.getJson.mockResolvedValue(null);

      const result = await service.getDetail('prod-1');

      expect(result).toBeNull();
    });
  });

  describe('setDetail', () => {
    it('сохраняет продукт с правильным ключом и TTL 300 секунд', async () => {
      const product = makeProductEntity();
      cache.setJson.mockResolvedValue(undefined);

      await service.setDetail('prod-1', product);

      expect(cache.setJson).toHaveBeenCalledWith(
        'product:detail:prod-1',
        product,
        300,
      );
    });
  });

  describe('getList', () => {
    const listParams = {
      categoryId: 'cat-1',
      ownerId: 'user-1',
      page: 1,
      limit: 20,
    };

    it('возвращает список продуктов из кеша (cache hit)', async () => {
      const cached = { items: [makeProductEntity()], total: 1 };
      cache.getJson.mockResolvedValue(cached);

      const result = await service.getList(listParams);

      expect(cache.getJson).toHaveBeenCalledWith(
        'product:list:cat-1:user-1:1:20',
      );
      expect(result).toBe(cached);
    });

    it('возвращает null при cache miss', async () => {
      cache.getJson.mockResolvedValue(null);

      const result = await service.getList(listParams);

      expect(result).toBeNull();
    });

    it('формирует ключ с "all" если categoryId/ownerId не переданы', async () => {
      cache.getJson.mockResolvedValue(null);

      await service.getList({ page: 1, limit: 20 });

      expect(cache.getJson).toHaveBeenCalledWith('product:list:all:all:1:20');
    });
  });

  describe('setList', () => {
    it('сохраняет список с правильным ключом и TTL 60 секунд', async () => {
      const params = {
        categoryId: 'cat-1',
        ownerId: undefined,
        page: 2,
        limit: 10,
      };
      const data = { items: [makeProductEntity()], total: 1 };
      cache.setJson.mockResolvedValue(undefined);

      await service.setList(params, data);

      expect(cache.setJson).toHaveBeenCalledWith(
        'product:list:cat-1:all:2:10',
        data,
        60,
      );
    });
  });

  describe('invalidateDetail', () => {
    it('вызывает deleteByPattern для конкретного продукта', async () => {
      cache.deleteByPattern.mockResolvedValue(undefined);

      await service.invalidateDetail('prod-1');

      expect(cache.deleteByPattern).toHaveBeenCalledWith(
        'product:detail:prod-1',
      );
    });

    it('вызывает deleteByPattern для инвалидации всех списков', async () => {
      cache.deleteByPattern.mockResolvedValue(undefined);

      await service.invalidateDetail('prod-1');

      expect(cache.deleteByPattern).toHaveBeenCalledWith('product:list:*');
    });

    it('вызывает deleteByPattern ровно 2 раза (detail + list)', async () => {
      cache.deleteByPattern.mockResolvedValue(undefined);

      await service.invalidateDetail('prod-1');

      expect(cache.deleteByPattern).toHaveBeenCalledTimes(2);
    });
  });
});
