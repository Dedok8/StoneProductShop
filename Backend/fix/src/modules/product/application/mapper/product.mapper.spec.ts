import { ProductEntity } from '@modules/product/domain/entities';

import { ProductMapper } from './product.mapper';

const makeProductEntity = (
  overrides: Partial<ConstructorParameters<typeof ProductEntity>[0]> = {},
): ProductEntity => {
  return new ProductEntity({
    id: 'a3f1c2e4-0000-0000-0000-000000000001',
    name: 'White Carrara Marble Slab',
    slug: 'white-carrara-marble-slab-a1b2c3d4',
    description: 'Premium Italian marble',
    price: 149.99,
    stock: 10,
    images: ['https://cdn.example.com/img1.jpg'],
    categoryId: 'a3f1c2e4-0000-0000-0000-000000000010',
    ownerId: 'a3f1c2e4-0000-0000-0000-000000000002',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    ...overrides,
  });
};

describe('ProductMapper', () => {
  describe('toResponse', () => {
    it('должен корректно маппить entity в DTO', () => {
      const entity = makeProductEntity();
      const result = ProductMapper.toResponse(entity);

      expect(result.id).toBe('a3f1c2e4-0000-0000-0000-000000000001');
      expect(result.name).toBe('White Carrara Marble Slab');
      expect(result.slug).toBe('white-carrara-marble-slab-a1b2c3d4');
      expect(result.price).toBe(149.99);
      expect(result.stock).toBe(10);
      expect(result.categoryId).toBe('a3f1c2e4-0000-0000-0000-000000000010');
      expect(result.ownerId).toBe('a3f1c2e4-0000-0000-0000-000000000002');
      expect(result.isActive).toBe(true);
      expect(result.createdAt).toEqual(new Date('2024-01-01'));
      expect(result.updatedAt).toEqual(new Date('2024-01-02'));
    });

    it('должен включать вычисляемое поле isInStock = true когда stock > 0', () => {
      const entity = makeProductEntity({ stock: 5 });
      const result = ProductMapper.toResponse(entity);
      expect(result.isInStock).toBe(true);
    });

    it('должен включать вычисляемое поле isInStock = false когда stock = 0', () => {
      const entity = makeProductEntity({ stock: 0 });
      const result = ProductMapper.toResponse(entity);
      expect(result.isInStock).toBe(false);
    });

    it('должен корректно обрабатывать description = null', () => {
      const entity = makeProductEntity({ description: null });
      const result = ProductMapper.toResponse(entity);
      expect(result.description).toBeNull();
    });

    it('должен корректно маппить пустой массив images', () => {
      const entity = makeProductEntity({ images: [] });
      const result = ProductMapper.toResponse(entity);
      expect(result.images).toEqual([]);
    });

    it('не должен содержать лишних полей (нет passwordHash, refreshToken и т.д.)', () => {
      const entity = makeProductEntity();
      const result = ProductMapper.toResponse(entity);
      expect(result).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('refreshToken');
    });
  });

  describe('toResponseList', () => {
    it('должен маппить массив entities в массив DTO', () => {
      const entities = [
        makeProductEntity({ id: 'a3f1c2e4-0000-0000-0000-000000000001' }),
        makeProductEntity({ id: 'a3f1c2e4-0000-0000-0000-000000000002' }),
      ];
      const result = ProductMapper.toResponseList(entities);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('a3f1c2e4-0000-0000-0000-000000000001');
      expect(result[1].id).toBe('a3f1c2e4-0000-0000-0000-000000000002');
    });

    it('должен вернуть пустой массив для пустого input', () => {
      const result = ProductMapper.toResponseList([]);
      expect(result).toEqual([]);
    });
  });
});
