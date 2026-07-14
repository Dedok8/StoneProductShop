import { ConflictException, NotFoundException } from '@nestjs/common';
import type { MockProxy } from 'jest-mock-extended';
import { mock } from 'jest-mock-extended';

import type { ProductQueryDto } from '@/model/product/application/dto/product.query.dto';
import { ProductService } from '@/model/product/application/product.service';
import { ProductEntity } from '@/model/product/domain/entities';
import type { IProductRepository } from '@/model/product/domain/interfaces';

const makeProduct = (overrides: Partial<ProductEntity> = {}): ProductEntity =>
  new ProductEntity({
    id: 'prod-1',
    name: 'Granite Slab',
    slug: 'granite-slab',
    description: 'Premium stone',
    price: 15000,
    stock: 10,
    images: ['https://example.com/1.jpg'],
    categoryId: 'cat-1',
    ownerId: 'owner-1',
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  });

describe('ProductService', () => {
  let service: ProductService;
  let repository: MockProxy<IProductRepository>;

  beforeEach(() => {
    repository = mock<IProductRepository>();
    service = new ProductService(repository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('findById', () => {
    it('возвращает замапленный product, если он найден', async () => {
      const product = makeProduct();
      repository.findById.mockResolvedValue(product);

      const result = await service.findById('prod-1');

      expect(repository.findById).toHaveBeenCalledWith('prod-1');
      expect(result.id).toBe('prod-1');
      expect(result.price).toBe(15000);
    });

    it('выбрасывает NotFoundException, если product не найден', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySlug', () => {
    it('возвращает product по slug', async () => {
      repository.findBySlug.mockResolvedValue(makeProduct());

      const result = await service.findBySlug('granite-slab');

      expect(result.slug).toBe('granite-slab');
    });

    it('выбрасывает NotFoundException, если slug не найден', async () => {
      repository.findBySlug.mockResolvedValue(null);

      await expect(service.findBySlug('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByName', () => {
    it('возвращает product по имени', async () => {
      repository.findByName.mockResolvedValue(makeProduct());

      const result = await service.findByName('Granite Slab');

      expect(result.name).toBe('Granite Slab');
    });

    it('выбрасывает NotFoundException, если имя не найдено', async () => {
      repository.findByName.mockResolvedValue(null);

      await expect(service.findByName('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('возвращает пагинированный список товаров с корректной мета-информацией', async () => {
      repository.findAll.mockResolvedValue({
        items: [makeProduct(), makeProduct({ id: 'prod-2' })],
        total: 2,
      });
      const query: ProductQueryDto = { page: 1, limit: 20 };

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

    it('подставляет дефолтные page/limit, если query их не содержит', async () => {
      repository.findAll.mockResolvedValue({ items: [], total: 0 });

      const result = await service.findAll({});

      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
      expect(result.items).toEqual([]);
    });
  });

  describe('create', () => {
    const dto = {
      name: 'Granite Slab',
      slug: 'granite-slab',
      price: 15000,
      stock: 10,
      images: ['https://example.com/1.jpg'],
      categoryId: 'cat-1',
    } as Parameters<ProductService['create']>[0];

    it('создаёт product с переданным ownerId, если имя и slug свободны', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.findBySlug.mockResolvedValue(null);
      repository.create.mockResolvedValue(makeProduct());

      const result = await service.create(dto, 'owner-1');

      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        ownerId: 'owner-1',
      });
      expect(result.id).toBe('prod-1');
    });

    it('выбрасывает ConflictException, если имя товара уже занято', async () => {
      repository.findByName.mockResolvedValue(makeProduct());

      await expect(service.create(dto, 'owner-1')).rejects.toThrow(
        ConflictException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('выбрасывает ConflictException, если slug товара уже занят', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.findBySlug.mockResolvedValue(makeProduct());

      await expect(service.create(dto, 'owner-1')).rejects.toThrow(
        ConflictException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('обновляет product, если новые имя/slug свободны', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.findBySlug.mockResolvedValue(null);
      repository.update.mockResolvedValue(makeProduct({ price: 20000 }));

      const result = await service.update('prod-1', { price: 20000 });

      expect(repository.update).toHaveBeenCalledWith('prod-1', {
        price: 20000,
      });
      expect(result.price).toBe(20000);
    });

    it('выбрасывает ConflictException, если новое имя занято другим товаром', async () => {
      repository.findByName.mockResolvedValue(
        makeProduct({ id: 'other-prod' }),
      );

      await expect(service.update('prod-1', { name: 'Taken' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('выбрасывает ConflictException, если новый slug занят другим товаром', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.findBySlug.mockResolvedValue(
        makeProduct({ id: 'other-prod' }),
      );

      await expect(
        service.update('prod-1', { slug: 'taken-slug' }),
      ).rejects.toThrow(ConflictException);
    });

    it('выбрасывает NotFoundException, если товар для обновления не существует', async () => {
      repository.update.mockResolvedValue(null);

      await expect(service.update('missing', { stock: 5 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('не проверяет уникальность, если name/slug не переданы', async () => {
      repository.update.mockResolvedValue(makeProduct({ stock: 5 }));

      await service.update('prod-1', { stock: 5 });

      expect(repository.findByName).not.toHaveBeenCalled();
      expect(repository.findBySlug).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('удаляет product, если он существует', async () => {
      repository.findById.mockResolvedValue(makeProduct());

      await service.delete('prod-1');

      expect(repository.delete).toHaveBeenCalledWith('prod-1');
    });

    it('выбрасывает NotFoundException и не вызывает delete, если product не найден', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
