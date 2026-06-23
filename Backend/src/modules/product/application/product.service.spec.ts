import { PRODUCT_REPOSITORY } from '@modules/product/domain';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { ProductCacheService } from './product-cache.service';
import { ProductService } from './product.service';

// ─── Фабрики ──────────────────────────────────────────────────────────────

const makeProduct = (overrides = {}) => ({
  id: 'prod-1',
  name: 'Granite Slab',
  slug: 'granite-slab-abc12345',
  description: 'Natural granite',
  price: 1500,
  stock: 10,
  images: [],
  categoryId: 'cat-1',
  ownerId: 'user-1',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  isInStock: () => true,
  isOwnerById: (id: string) => id === 'user-1',
  ...overrides,
});

const makeRequester = (overrides = {}) => ({
  userId: 'user-1',
  role: 'USER',
  ...overrides,
});

const makeCreateDto = (overrides = {}) => ({
  name: 'Marble Floor',
  description: 'Italian marble',
  price: 2500,
  stock: 5,
  images: [],
  categoryId: 'cat-1',
  isActive: true,
  ...overrides,
});

const makeQueryDto = (overrides = {}) => ({
  page: 1,
  limit: 10,
  skip: 0,
  ...overrides,
});

// ─── Тесты ────────────────────────────────────────────────────────────────

describe('ProductService', () => {
  let service: ProductService;

  const repo = {
    findById: jest.fn(),
    findBySlug: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  };

  const cache = {
    getDetail: jest.fn(),
    setDetail: jest.fn(),
    getList: jest.fn(),
    setList: jest.fn(),
    invalidateDetail: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PRODUCT_REPOSITORY, useValue: repo },
        { provide: ProductCacheService, useValue: cache },
      ],
    }).compile();

    service = module.get(ProductService);
    jest.clearAllMocks();
  });

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('успешно создаёт продукт', async () => {
      repo.findBySlug.mockResolvedValue(null);
      repo.create.mockResolvedValue(makeProduct());

      const result = await service.create(makeCreateDto(), 'user-1');

      expect(result).toBeDefined();
      expect(repo.create).toHaveBeenCalledTimes(1);
    });

    it('генерирует slug из name', async () => {
      repo.findBySlug.mockResolvedValue(null);
      repo.create.mockResolvedValue(makeProduct());

      await service.create(makeCreateDto({ name: 'Marble Floor' }), 'user-1');

      const [createArg] = repo.create.mock.calls[0] as [
        Record<string, unknown>,
      ];
      expect(createArg.slug).toMatch(/^marble-floor-[a-f0-9]{8}$/);
    });

    it('передаёт ownerId в репозиторий', async () => {
      repo.findBySlug.mockResolvedValue(null);
      repo.create.mockResolvedValue(makeProduct());

      await service.create(makeCreateDto(), 'owner-42');

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ ownerId: 'owner-42' }),
      );
    });

    it('ConflictException если продукт с таким slug уже существует', async () => {
      repo.findBySlug.mockResolvedValue(makeProduct());

      await expect(service.create(makeCreateDto(), 'user-1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('не вызывает create при конфликте slug', async () => {
      repo.findBySlug.mockResolvedValue(makeProduct());

      await service.create(makeCreateDto(), 'user-1').catch(() => {});

      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  // ─── findById ─────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('возвращает продукт из кеша если есть', async () => {
      const cached = makeProduct();
      cache.getDetail.mockResolvedValue(cached);

      const result = await service.findById('prod-1');

      expect(result).toEqual(cached);
      expect(repo.findById).not.toHaveBeenCalled();
    });

    it('идёт в базу если кеш пустой', async () => {
      cache.getDetail.mockResolvedValue(null);
      repo.findById.mockResolvedValue(makeProduct());

      await service.findById('prod-1');

      expect(repo.findById).toHaveBeenCalledWith('prod-1');
    });

    it('кеширует результат после получения из базы', async () => {
      const product = makeProduct();
      cache.getDetail.mockResolvedValue(null);
      repo.findById.mockResolvedValue(product);

      await service.findById('prod-1');

      expect(cache.setDetail).toHaveBeenCalledWith('prod-1', product);
    });

    it('НЕ кеширует при cache hit — setDetail не вызывается', async () => {
      cache.getDetail.mockResolvedValue(makeProduct());

      await service.findById('prod-1');

      expect(cache.setDetail).not.toHaveBeenCalled();
    });

    it('NotFoundException если нет ни в кеше ни в базе', async () => {
      cache.getDetail.mockResolvedValue(null);
      repo.findById.mockResolvedValue(null);

      await expect(service.findById('ghost')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── findMany ─────────────────────────────────────────────────────────────

  describe('findMany', () => {
    it('возвращает список из кеша если есть', async () => {
      const cached = { items: [makeProduct()], total: 1 };
      cache.getList.mockResolvedValue(cached);

      const result = await service.findMany(makeQueryDto());

      expect(result.items).toHaveLength(1);
      expect(repo.findMany).not.toHaveBeenCalled();
    });

    it('идёт в базу если список не закеширован', async () => {
      cache.getList.mockResolvedValue(null);
      repo.findMany.mockResolvedValue({ items: [], total: 0 });

      await service.findMany(makeQueryDto());

      expect(repo.findMany).toHaveBeenCalledTimes(1);
    });

    it('возвращает page и limit в ответе', async () => {
      cache.getList.mockResolvedValue(null);
      repo.findMany.mockResolvedValue({ items: [], total: 0 });

      const result = await service.findMany(
        makeQueryDto({ page: 2, limit: 20 }),
      );

      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
    });

    it('фильтрует по isActive: true по умолчанию', async () => {
      cache.getList.mockResolvedValue(null);
      repo.findMany.mockResolvedValue({ items: [], total: 0 });

      await service.findMany(makeQueryDto());

      expect(repo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true }),
      );
    });
  });

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    it('успешно обновляет продукт владельцем', async () => {
      const product = makeProduct({ isOwnerById: () => true });
      repo.findById.mockResolvedValue(product);
      repo.update.mockResolvedValue(makeProduct({ name: 'Updated Name' }));

      const result = await service.update(
        'prod-1',
        { name: 'Updated Name' },
        makeRequester(),
      );

      expect(result.name).toBe('Updated Name');
    });

    it('успешно обновляет продукт администратором', async () => {
      const product = makeProduct({ isOwnerById: () => false });
      repo.findById.mockResolvedValue(product);
      repo.update.mockResolvedValue(makeProduct());

      await expect(
        service.update('prod-1', {}, makeRequester({ role: 'ADMIN' })),
      ).resolves.not.toThrow();
    });

    it('обновляет slug если изменилось name', async () => {
      const product = makeProduct({ isOwnerById: () => true });
      repo.findById.mockResolvedValue(product);
      repo.update.mockResolvedValue(makeProduct());

      await service.update('prod-1', { name: 'New Name' }, makeRequester());

      const [, updateArg] = repo.update.mock.calls[0] as [
        string,
        Record<string, unknown>,
      ];
      expect(updateArg).toHaveProperty('slug');
      expect(updateArg.slug).toMatch(/^new-name-[a-f0-9]{8}$/);
    });

    it('НЕ обновляет slug если name не изменилось', async () => {
      const product = makeProduct({ isOwnerById: () => true });
      repo.findById.mockResolvedValue(product);
      repo.update.mockResolvedValue(makeProduct());

      await service.update('prod-1', { price: 999 }, makeRequester());

      const [, updateArg] = repo.update.mock.calls[0] as [
        string,
        Record<string, unknown>,
      ];
      expect(updateArg).not.toHaveProperty('slug');
    });

    it('инвалидирует кеш после обновления', async () => {
      const product = makeProduct({ isOwnerById: () => true });
      repo.findById.mockResolvedValue(product);
      repo.update.mockResolvedValue(makeProduct());

      await service.update('prod-1', {}, makeRequester());

      expect(cache.invalidateDetail).toHaveBeenCalledWith('prod-1');
    });

    it('ForbiddenException если не владелец и не admin', async () => {
      const product = makeProduct({ isOwnerById: () => false });
      repo.findById.mockResolvedValue(product);

      await expect(
        service.update('prod-1', {}, makeRequester({ userId: 'other-user' })),
      ).rejects.toThrow(ForbiddenException);
    });

    it('NotFoundException если продукт не найден', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.update('ghost', {}, makeRequester()),
      ).rejects.toThrow(NotFoundException);
    });

    it('не вызывает repo.update при ForbiddenException', async () => {
      const product = makeProduct({ isOwnerById: () => false });
      repo.findById.mockResolvedValue(product);

      await service
        .update('prod-1', {}, makeRequester({ userId: 'other' }))
        .catch(() => {});

      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  // ─── delete ───────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('успешно удаляет продукт владельцем', async () => {
      const product = makeProduct({ isOwnerById: () => true });
      repo.findById.mockResolvedValue(product);

      await expect(
        service.delete('prod-1', makeRequester()),
      ).resolves.not.toThrow();

      expect(repo.delete).toHaveBeenCalledWith('prod-1');
    });

    it('успешно удаляет продукт администратором', async () => {
      const product = makeProduct({ isOwnerById: () => false });
      repo.findById.mockResolvedValue(product);

      await expect(
        service.delete('prod-1', makeRequester({ role: 'ADMIN' })),
      ).resolves.not.toThrow();
    });

    it('инвалидирует кеш после удаления', async () => {
      const product = makeProduct({ isOwnerById: () => true });
      repo.findById.mockResolvedValue(product);

      await service.delete('prod-1', makeRequester());

      expect(cache.invalidateDetail).toHaveBeenCalledWith('prod-1');
    });

    it('ForbiddenException если не владелец и не admin', async () => {
      const product = makeProduct({ isOwnerById: () => false });
      repo.findById.mockResolvedValue(product);

      await expect(
        service.delete('prod-1', makeRequester({ userId: 'stranger' })),
      ).rejects.toThrow(ForbiddenException);
    });

    it('NotFoundException если продукт не найден', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.delete('ghost', makeRequester())).rejects.toThrow(
        NotFoundException,
      );
    });

    it('не вызывает repo.delete при ForbiddenException', async () => {
      const product = makeProduct({ isOwnerById: () => false });
      repo.findById.mockResolvedValue(product);

      await service
        .delete('prod-1', makeRequester({ userId: 'other' }))
        .catch(() => {});

      expect(repo.delete).not.toHaveBeenCalled();
    });
  });
});
