import { ProductEntity } from './product.entity';

describe('ProductEntity', () => {
  const productProps = {
    id: 'prod-1',
    name: 'Granite Slab',
    slug: 'granite-slab',
    description: 'Natural granite',
    price: 500,
    stock: 10,
    images: ['image.jpg'],
    categoryId: 'category-1',
    ownerId: 'user-1',
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  };

  it('creates an entity with the provided properties', () => {
    const product = new ProductEntity(productProps);

    expect(product.id).toBe('prod-1');
    expect(product.name).toBe('Granite Slab');
    expect(product.price).toBe(500);
    expect(product.ownerId).toBe('user-1');
  });

  it('returns true when product is in stock', () => {
    const product = new ProductEntity(productProps);

    expect(product.isInStock()).toBe(true);
  });

  it('returns false when product is out of stock', () => {
    const product = new ProductEntity({ ...productProps, stock: 0 });

    expect(product.isInStock()).toBe(false);
  });

  it('checks whether the provided user id belongs to the owner', () => {
    const product = new ProductEntity(productProps);

    expect(product.isOwnerById('user-1')).toBe(true);
    expect(product.isOwnerById('user-2')).toBe(false);
  });

  it('creates an entity from persistence and converts string price to number', () => {
    const product = ProductEntity.fromPersistence({
      ...productProps,
      price: '149.99',
    });

    expect(product).toBeInstanceOf(ProductEntity);
    expect(product.price).toBe(149.99);
  });
});
