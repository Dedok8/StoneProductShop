import { ConflictException, NotFoundException } from '@nestjs/common';
import type { MockProxy } from 'jest-mock-extended';
import { mock } from 'jest-mock-extended';

import type { ProductQueryDto } from '@/model/product/application/dto';
import { ProductService } from '@/model/product/application/product.service';
import type { IProductRepository } from '@/model/product/domain';
import { ProductEntity } from '@/model/product/domain';

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

describe('productService', () => {
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
    it('returns the mapped product, if found', async () => {
      const product = makeProduct();

      repository.findById.mockResolvedValue(product);

      const result = await service.findById('product-1');

      expect(repository.findById).toHaveBeenCalledWith('product-1');
      expect(result.id).toBe('product-1');
      expect(result.price).toBe(150000);
    });

    it('throws a NotFoundException if the product is not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySlug', () => {
    it('returns the product by slug', async () => {
      repository.findBySlug.mockResolvedValue(makeProduct());

      const result = service.findBySlug('granite-slab');

      expect((await result).slug).toBe('granite-slab');
    });

    it('throws a NotFoundException if the slug is not found', async () => {
      repository.findBySlug.mockResolvedValue(null);

      await expect(service.findBySlug('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByName', () => {
    it('returns the product by name', async () => {
      repository.findByName.mockResolvedValue(makeProduct());

      const result = await service.findByName('Granite Slab');

      expect(result.name).toBe('Granite Slab');
    });

    it('throws a NotFoundException if the name is not found', async () => {
      repository.findByName.mockResolvedValue(null);

      await expect(service.findByName('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('returns a paginated list of products with correct metadata', async () => {
      repository.findAll.mockResolvedValue({
        items: [makeProduct(), makeProduct({ id: 'product-2' })],
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
      name: 'Granite Slab',
      slug: 'granite-slab',
      price: 15000,
      stock: 10,
      images: ['https://example.com/1.jpg'],
      categoryId: 'cat-1',
    } as Parameters<ProductService['create']>[0];

    it('creates a product with the specified ownerId, provided the name and slug are available', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.findBySlug.mockResolvedValue(null);
      repository.create.mockResolvedValue(makeProduct());

      const result = await service.create(dto, 'owner-1');

      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        ownerId: 'owner-1',
      });
      expect(result.id).toBe('product-1');
    });

    it('throws a ConflictException if the product name is already taken', async () => {
      repository.findByName.mockResolvedValue(makeProduct());

      await expect(service.create(dto, 'owner-1')).rejects.toThrow(
        ConflictException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('throws a ConflictException if the slug is already taken', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.findBySlug.mockResolvedValue(makeProduct());

      await expect(service.create(dto, 'owner-1')).rejects.toThrow(
        ConflictException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates the product if the new name/slug is available', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.findBySlug.mockResolvedValue(null);
      repository.update.mockResolvedValue(makeProduct({ price: 20000 }));

      const result = await service.update('product-1', { price: 20000 });

      expect(repository.update).toHaveBeenCalledWith('product-1', {
        price: 20000,
      });
      expect(result.price).toBe(20000);
    });

    it('throws a ConflictException if the new name is already taken by another product', async () => {
      repository.findByName.mockResolvedValue(
        makeProduct({ id: 'other-prod' }),
      );

      await expect(service.update('prod-1', { name: 'Taken' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws a ConflictException if the new slug is already taken by another product', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.findBySlug.mockResolvedValue(
        makeProduct({ id: 'other-prod' }),
      );

      await expect(
        service.update('prod-1', { slug: 'taken-slug' }),
      ).rejects.toThrow(ConflictException);
    });

    it('throws a NotFoundException if the item to be updated does not exist', async () => {
      repository.update.mockResolvedValue(null);

      await expect(service.update('missing', { stock: 5 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('does not check for uniqueness if name/slug are not provided', async () => {
      repository.update.mockResolvedValue(makeProduct({ stock: 5 }));

      await service.update('prod-1', { stock: 5 });

      expect(repository.findByName).not.toHaveBeenCalled();
      expect(repository.findBySlug).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deletes the product if it exists', async () => {
      repository.findById.mockResolvedValue(makeProduct());

      await service.delete('prod-1');

      expect(repository.delete).toHaveBeenCalledWith('product-1');
    });

    it('throws a NotFoundException and does not call `delete` if the product is not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
