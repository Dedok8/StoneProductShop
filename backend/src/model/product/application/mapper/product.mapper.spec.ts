import { ProductResponseDto } from '@/model/product/application/dto';
import { ProductMapper } from '@/model/product/application/mapper';
import { ProductEntity } from '@/model/product/domain';

describe('ProductMapper', () => {
  const mockDate = new Date();

  const createMockProduct = (
    description: string | null = 'Premium gray granite slab',
  ): ProductEntity => {
    return new ProductEntity({
      id: 'product-1',
      name: 'Granite Slab',
      slug: 'granite-slab',
      description,
      price: 1500,
      stock: 25,
      images: ['image1.png', 'image2.png'],
      categoryId: 'category-1',
      ownerId: 'owner-1',
      isActive: true,
      createdAt: mockDate,
      updatedAt: mockDate,
    });
  };

  describe('toResponse', () => {
    it('should transform ProductEntity into ProductResponseDto instance with all correct fields', () => {
      const entity = createMockProduct();

      const result = ProductMapper.toResponse(entity);

      expect(result).toBeInstanceOf(ProductResponseDto);

      expect(result.id).toBe('product-1');
      expect(result.name).toBe('Granite Slab');
      expect(result.slug).toBe('granite-slab');
      expect(result.description).toBe('Premium gray granite slab');
      expect(result.price).toBe(1500);
      expect(result.stock).toBe(25);
      expect(result.images).toEqual(['image1.png', 'image2.png']);
      expect(result.categoryId).toBe('category-1');

      expect(result).not.toHaveProperty('ownerId');
      expect(result).not.toHaveProperty('isActive');
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('updatedAt');
    });

    it('should fallback description to an empty string if it is null in the entity', () => {
      const entity = createMockProduct(null);

      const result = ProductMapper.toResponse(entity);

      expect(result.description).toBe('');
    });
  });

  describe('toResponseList', () => {
    it('should transform an array of ProductEntity into an array of ProductResponseDto instances', () => {
      const entities = [
        createMockProduct(),
        createMockProduct('Another description'),
      ];

      const result = ProductMapper.toResponseList(entities);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(ProductResponseDto);
      expect(result[1]).toBeInstanceOf(ProductResponseDto);
      expect(result[0].id).toBe('product-1');
      expect(result[1].description).toBe('Another description');
    });
  });
});
