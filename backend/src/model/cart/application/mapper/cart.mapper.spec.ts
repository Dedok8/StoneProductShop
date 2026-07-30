import { CartMapper } from '@/model/cart/application/mapper/cart.mapper';
import { CartEntity, CartItemEntity } from '@/model/cart/domain';
import { ProductResponseDto } from '@/model/product/application/dto';

const createMockCartItem = (
  overrides: Partial<{ productId: string; quantity: number }> = {},
): CartItemEntity =>
  new CartItemEntity({
    productId: 'product-1',
    quantity: 1,
    ...overrides,
  });

const createMockCart = (
  overrides: Partial<{
    id: string;
    userId: string;
    items: CartItemEntity[];
    createdAt: Date;
    updatedAt: Date;
  }> = {},
): CartEntity =>
  new CartEntity({
    id: 'cart-1',
    userId: 'user-1',
    items: [createMockCartItem()],
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  });

const createMockProduct = (
  overrides: Partial<ConstructorParameters<typeof ProductResponseDto>[0]> = {},
): ProductResponseDto =>
  new ProductResponseDto({
    id: 'product-1',
    name: 'Granite Slab Premium',
    slug: 'granite-slab-premium',
    description: 'High-quality natural stone slab',
    price: 15000,
    stock: 10,
    images: ['https://example.com/stone.jpg'],
    categoryId: 'category-1',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    isActive: true,
    ...overrides,
  });

const toProductMap = (
  ...products: ProductResponseDto[]
): Map<string, ProductResponseDto> => new Map(products.map((p) => [p.id, p]));

describe('CartMapper', () => {
  describe('toResponse', () => {
    it('passes the top-level fields of the basket through unchanged', () => {
      const entity = createMockCart({
        id: 'cart-42',
        userId: 'user-42',
        items: [],
      });

      const result = CartMapper.toResponse(entity, new Map());

      expect(result.id).toBe('cart-42');
      expect(result.userId).toBe('user-42');
      expect(result.createdAt).toBe(entity.createdAt);
      expect(result.updatedAt).toBe(entity.updatedAt);
      expect(result.items).toEqual([]);
    });

    it.each<{
      name: string;
      isActive: boolean;
      stock: number;
      quantity: number;
      expectedIsStock: boolean;
    }>([
      {
        name: "It's active, and there's enough left",
        isActive: true,
        stock: 10,
        quantity: 5,
        expectedIsStock: true,
      },
      {
        name: 'is active and the remaining quantity equals the requested quantity (threshold)',
        isActive: true,
        stock: 5,
        quantity: 5,
        expectedIsStock: true,
      },
      {
        name: "It's active, but there isn't enough balance",
        isActive: true,
        stock: 2,
        quantity: 5,
        expectedIsStock: false,
      },
      {
        name: 'It is inactive, even though there is enough of it left',
        isActive: false,
        stock: 10,
        quantity: 5,
        expectedIsStock: false,
      },
    ])(
      'correctly calculates isStock: $name',
      ({ isActive, stock, quantity, expectedIsStock }) => {
        const entity = createMockCart({
          items: [createMockCartItem({ productId: 'product-1', quantity })],
        });
        const product = createMockProduct({ isActive, stock });

        const result = CartMapper.toResponse(entity, toProductMap(product));

        expect(result.items[0].isStock).toBe(expectedIsStock);
      },
    );

    it('sets default values if an item is missing from the products map', () => {
      const entity = createMockCart({
        items: [createMockCartItem({ productId: 'missing-product' })],
      });

      const result = CartMapper.toResponse(entity, new Map());

      expect(result.items[0]).toMatchObject({
        productId: 'missing-product',
        name: 'This item is out of stock',
        price: 0,
        isStock: false,
      });
    });

    it('maps several items in their original order', () => {
      const entity = createMockCart({
        items: [
          createMockCartItem({ productId: 'product-1', quantity: 1 }),
          createMockCartItem({ productId: 'product-2', quantity: 3 }),
        ],
      });
      const products = toProductMap(
        createMockProduct({ id: 'product-1', name: 'First' }),
        createMockProduct({ id: 'product-2', name: 'Second', stock: 1 }),
      );

      const result = CartMapper.toResponse(entity, products);

      expect(result.items.map((i) => i.productId)).toEqual([
        'product-1',
        'product-2',
      ]);
      expect(result.items[0].name).toBe('First');
      expect(result.items[1]).toMatchObject({ name: 'Second', isStock: false });
    });
  });
});
