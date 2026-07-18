import { mock, type MockProxy } from 'jest-mock-extended';

import type {
  CreateProductDto,
  PaginatedProductResponseDto,
  ProductQueryDto,
  ProductResponseDto,
  ProductService,
  UpdateProductDto,
} from '@/model/product/application';
import { ProductController } from '@/model/product/presentation';

describe('productController', () => {
  let controller: ProductController;
  let service: MockProxy<ProductService>;

  const mockProductResponse = { id: 'prod-1' } as ProductResponseDto;
  const mockPaginatedResponse = {
    items: [],
    total: 0,
  } as unknown as PaginatedProductResponseDto;

  beforeEach(() => {
    service = mock<ProductService>();
    controller = new ProductController(service);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getAll', () => {
    it('delegates to productService.findAll with the raw query', async () => {
      const query = { page: 1, limit: 20 } as ProductQueryDto;
      service.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.getAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toBe(mockPaginatedResponse);
    });
  });

  describe('findById', () => {
    it('delegates to productService.findById with the id', async () => {
      service.findById.mockResolvedValue(mockProductResponse);

      const result = await controller.findById('prod-1');

      expect(service.findById).toHaveBeenCalledWith('prod-1');
      expect(result).toBe(mockProductResponse);
    });
  });

  describe('create', () => {
    it('delegates to productService.create with the dto and the current user as ownerId', async () => {
      const dto = {
        name: 'Granite Slab',
        slug: 'granite-slab',
        price: 15000,
        stock: 10,
        images: ['https://example.com/1.jpg'],
        categoryId: 'cat-1',
      } as CreateProductDto;
      service.create.mockResolvedValue(mockProductResponse);

      const result = await controller.create(dto, 'owner-1');

      expect(service.create).toHaveBeenCalledWith(dto, 'owner-1');
      expect(result).toBe(mockProductResponse);
    });
  });

  describe('update', () => {
    it('delegates to productService.update with the id and dto', async () => {
      const dto = { price: 20000 } as UpdateProductDto;
      service.update.mockResolvedValue(mockProductResponse);

      const result = await controller.update('prod-1', dto);

      expect(service.update).toHaveBeenCalledWith('prod-1', dto);
      expect(result).toBe(mockProductResponse);
    });
  });

  describe('delete', () => {
    it('delegates to productService.delete with the id', async () => {
      await controller.delete('prod-1');

      expect(service.delete).toHaveBeenCalledWith('prod-1');
    });
  });
});
