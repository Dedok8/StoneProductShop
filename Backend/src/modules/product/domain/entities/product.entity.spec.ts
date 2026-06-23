// src/modules/product/domain/entities/product.entity.spec.ts
import { ProductEntity } from './product.entity';

const makeProps = (overrides = {}) => ({
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
  ...overrides,
});

describe('ProductEntity', () => {
  describe('isInStock', () => {
    it('true если stock > 0', () => {
      const product = new ProductEntity(makeProps({ stock: 5 }));
      expect(product.isInStock()).toBe(true);
    });

    it('false если stock === 0', () => {
      const product = new ProductEntity(makeProps({ stock: 0 }));
      expect(product.isInStock()).toBe(false);
    });

    it('false если stock отрицательный', () => {
      const product = new ProductEntity(makeProps({ stock: -1 }));
      expect(product.isInStock()).toBe(false);
    });
  });

  describe('isOwnerById', () => {
    it('true если userId совпадает с ownerId', () => {
      const product = new ProductEntity(makeProps({ ownerId: 'user-42' }));
      expect(product.isOwnerById('user-42')).toBe(true);
    });

    it('false если userId не совпадает', () => {
      const product = new ProductEntity(makeProps({ ownerId: 'user-1' }));
      expect(product.isOwnerById('user-2')).toBe(false);
    });

    it('false для пустой строки', () => {
      const product = new ProductEntity(makeProps({ ownerId: 'user-1' }));
      expect(product.isOwnerById('')).toBe(false);
    });
  });

  describe('fromPersistence', () => {
    it('создаёт entity из сырых данных', () => {
      const raw = makeProps();
      const entity = ProductEntity.fromPersistence(raw);
      expect(entity).toBeInstanceOf(ProductEntity);
      expect(entity.id).toBe('prod-1');
    });

    it('конвертирует price из строки в number', () => {
      const raw = makeProps({ price: '1500.50' });
      const entity = ProductEntity.fromPersistence(raw);
      expect(typeof entity.price).toBe('number');
      expect(entity.price).toBe(1500.5);
    });

    it('оставляет price числом если уже number', () => {
      const raw = makeProps({ price: 2500 });
      const entity = ProductEntity.fromPersistence(raw);
      expect(entity.price).toBe(2500);
    });
  });
});
