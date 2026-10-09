import { ErrorCode } from '@stone-shop/shared';
import type { MockProxy } from 'jest-mock-extended';
import { mock } from 'jest-mock-extended';

import { CategoryEntity } from '@/model/category/domain/entities';
import type { ICategoryRepository } from '@/model/category/domain/interfaces';
import { ProductService } from '@/model/product/application';
import type {
  CreateProductDto,
  ProductQueryDto,
} from '@/model/product/application/dto/product.dto';
import type { IProductRepository } from '@/model/product/domain';
import { ProductEntity } from '@/model/product/domain';

const makeCategory = (
  overrides: Partial<CategoryEntity> = {},
): CategoryEntity =>
  new CategoryEntity({
    id: 'category-1',
    name: 'Granite',
    slug: 'granite',
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  });

const makeProduct = (overrides: Partial<ProductEntity> = {}): ProductEntity =>
  new ProductEntity({
    id: 'product-1',
    name: 'Granite Slab',
    slug: 'granite-slab',
    description: 'Premium stone',
    price: 15000,
    stock: 10,
    images: [],
    categoryId: 'category-1',
    category: makeCategory(),
    productTypeId: null,
    productType: null,
    originId: null,
    origin: null,
    colorId: null,
    color: null,
    ownerId: 'owner-1',
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  });

const expectCode = (promise: Promise<unknown>, code: ErrorCode) =>
  expect(promise).rejects.toMatchObject({ code });

describe('ProductService', () => {
  let service: ProductService;
  let repository: MockProxy<IProductRepository>;
  let categoryRepository: MockProxy<ICategoryRepository>;

  beforeEach(() => {
    repository = mock<IProductRepository>();
    categoryRepository = mock<ICategoryRepository>();
    categoryRepository.findById.mockResolvedValue(makeCategory());
    service = new ProductService(repository, categoryRepository);
  });

  describe('findById', () => {
    it('returns the mapped product', async () => {
      repository.findById.mockResolvedValue(makeProduct());

      const result = await service.findById('product-1');

      expect(repository.findById).toHaveBeenCalledWith('product-1');
      expect(result.id).toBe('product-1');
      expect(result.price).toBe(15000);
    });

    it('throws NOT_FOUND if the product does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expectCode(service.findById('missing'), ErrorCode.NOT_FOUND);
    });
  });

  describe('findBySlug', () => {
    it('returns the product by slug', async () => {
      repository.findBySlug.mockResolvedValue(makeProduct());

      const result = await service.findBySlug('granite-slab');

      expect(result.slug).toBe('granite-slab');
    });

    it('throws NOT_FOUND if the slug does not exist', async () => {
      repository.findBySlug.mockResolvedValue(null);

      await expectCode(service.findBySlug('unknown'), ErrorCode.NOT_FOUND);
    });
  });

  describe('findByName', () => {
    it('returns the product by name', async () => {
      repository.findByName.mockResolvedValue(makeProduct());

      const result = await service.findByName('Granite Slab');

      expect(result.name).toBe('Granite Slab');
    });

    it('throws NOT_FOUND if the name does not exist', async () => {
      repository.findByName.mockResolvedValue(null);

      await expectCode(service.findByName('unknown'), ErrorCode.NOT_FOUND);
    });
  });

  describe('findAll', () => {
    it('returns items with correct pagination meta', async () => {
      repository.findAll.mockResolvedValue({
        items: [makeProduct(), makeProduct({ id: 'product-2' })],
        total: 2,
      });

      const query = { page: 1, limit: 20 } as ProductQueryDto;
      const result = await service.findAll(query);

      expect(repository.findAll).toHaveBeenCalledWith(query);
      expect(result.items).toHaveLength(2);
      expect(result.meta).toEqual(
        expect.objectContaining({ page: 1, limit: 20, total: 2 }),
      );
    });

    it('uses default page and limit when the query omits them', async () => {
      repository.findAll.mockResolvedValue({ items: [], total: 0 });

      const result = await service.findAll({} as ProductQueryDto);

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
      images: [{ url: 'https://example.com/1.jpg', alt: 'Granite' }],
      categoryId: 'category-1',
    } as unknown as CreateProductDto;

    it('creates a product with ownerId when name and slug are free', async () => {
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

    it('throws ALREADY_EXISTS if the name is taken', async () => {
      repository.findByName.mockResolvedValue(makeProduct());

      await expectCode(
        service.create(dto, 'owner-1'),
        ErrorCode.ALREADY_EXISTS,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('throws ALREADY_EXISTS if the slug is taken', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.findBySlug.mockResolvedValue(makeProduct());

      await expectCode(
        service.create(dto, 'owner-1'),
        ErrorCode.ALREADY_EXISTS,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('throws VALIDATION_FAILED if the category does not exist', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.findBySlug.mockResolvedValue(null);
      categoryRepository.findById.mockResolvedValue(null);

      await expectCode(
        service.create(dto, 'owner-1'),
        ErrorCode.VALIDATION_FAILED,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    beforeEach(() => {
      repository.findById.mockResolvedValue(makeProduct());
    });

    it('updates the product when the new name and slug are free', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.findBySlug.mockResolvedValue(null);
      repository.update.mockResolvedValue(makeProduct({ price: 20000 }));

      const result = await service.update('product-1', { price: 20000 });

      expect(repository.update).toHaveBeenCalledWith('product-1', {
        price: 20000,
      });
      expect(result.price).toBe(20000);
    });

    it('throws NOT_FOUND if the product does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expectCode(
        service.update('missing', { stock: 5 }),
        ErrorCode.NOT_FOUND,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('throws ALREADY_EXISTS if the name belongs to another product', async () => {
      repository.findByName.mockResolvedValue(
        makeProduct({ id: 'other-product' }),
      );

      await expectCode(
        service.update('product-1', { name: 'Taken' }),
        ErrorCode.ALREADY_EXISTS,
      );
    });

    it('throws ALREADY_EXISTS if the slug belongs to another product', async () => {
      repository.findBySlug.mockResolvedValue(
        makeProduct({ id: 'other-product' }),
      );

      await expectCode(
        service.update('product-1', { slug: 'taken-slug' }),
        ErrorCode.ALREADY_EXISTS,
      );
    });

    it('allows keeping its own name (same product id)', async () => {
      repository.findByName.mockResolvedValue(makeProduct({ id: 'product-1' }));
      repository.update.mockResolvedValue(makeProduct());

      await expect(
        service.update('product-1', { name: 'Granite Slab' }),
      ).resolves.toBeDefined();
    });

    it('throws NOT_FOUND if the repository returns null on update', async () => {
      repository.update.mockResolvedValue(null);

      await expectCode(
        service.update('product-1', { stock: 5 }),
        ErrorCode.NOT_FOUND,
      );
    });

    it('skips uniqueness checks when name and slug are not provided', async () => {
      repository.update.mockResolvedValue(makeProduct({ stock: 5 }));

      await service.update('product-1', { stock: 5 });

      expect(repository.findByName).not.toHaveBeenCalled();
      expect(repository.findBySlug).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deletes the product if it exists', async () => {
      repository.findById.mockResolvedValue(makeProduct());

      await service.delete('product-1');

      expect(repository.delete).toHaveBeenCalledWith('product-1');
    });

    it('throws NOT_FOUND and does not delete if the product is missing', async () => {
      repository.findById.mockResolvedValue(null);

      await expectCode(service.delete('missing'), ErrorCode.NOT_FOUND);
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
