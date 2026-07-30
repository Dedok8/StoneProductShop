import { mock, type MockProxy } from 'jest-mock-extended';

import { CartService } from '@/model/cart/application/cart.service';
import { CartEntity, CartItemEntity } from '@/model/cart/domain';
import type { CartRepository } from '@/model/cart/infrastructure';
import type { ProductService } from '@/model/product';
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

describe('CartService', () => {
  let service: CartService;
  let cartRepository: MockProxy<CartRepository>;
  let productService: MockProxy<ProductService>;

  beforeEach(() => {
    cartRepository = mock<CartRepository>();
    productService = mock<ProductService>();
    service = new CartService(cartRepository, productService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getCart', () => {
    it('fetches or creates the cart, resolves its products, and maps to a response', async () => {
      const cart = createMockCart();
      cartRepository.getOrCreate.mockResolvedValue(cart);
      productService.findByIds.mockResolvedValue([createMockProduct()]);

      const result = await service.getCart('user-1');

      expect(cartRepository.getOrCreate).toHaveBeenCalledWith('user-1');
      expect(productService.findByIds).toHaveBeenCalledWith(['product-1']);
      expect(result.id).toBe('cart-1');
      expect(result.items[0]).toMatchObject({
        productId: 'product-1',
        name: 'Granite Slab Premium',
        price: 15000,
        isStock: true,
      });
    });

    it('falls back to defaults for items whose product could not be resolved', async () => {
      const cart = createMockCart({
        items: [createMockCartItem({ productId: 'missing-product' })],
      });
      cartRepository.getOrCreate.mockResolvedValue(cart);
      productService.findByIds.mockResolvedValue([]);

      const result = await service.getCart('user-1');

      expect(result.items[0]).toMatchObject({
        productId: 'missing-product',
        name: 'This item is out of stock',
        price: 0,
        isStock: false,
      });
    });
  });

  describe('addItem', () => {
    it('adds the item via the repository and returns the mapped cart', async () => {
      const cart = createMockCart();
      cartRepository.addItem.mockResolvedValue(cart);
      productService.findByIds.mockResolvedValue([createMockProduct()]);

      const result = await service.addItem('user-1', 'product-1', 2);

      expect(cartRepository.addItem).toHaveBeenCalledWith(
        'user-1',
        'product-1',
        2,
      );
      expect(result.id).toBe('cart-1');
    });
  });

  describe('setItemQuantity', () => {
    it('updates the quantity via the repository and returns the mapped cart', async () => {
      const cart = createMockCart({
        items: [createMockCartItem({ quantity: 5 })],
      });
      cartRepository.setItemQuantity.mockResolvedValue(cart);
      productService.findByIds.mockResolvedValue([createMockProduct()]);

      const result = await service.setItemQuantity('user-1', 'product-1', 5);

      expect(cartRepository.setItemQuantity).toHaveBeenCalledWith(
        'user-1',
        'product-1',
        5,
      );
      expect(result.items[0].quantity).toBe(5);
    });
  });

  describe('removeItem', () => {
    it('removes the item via the repository and returns the mapped (possibly empty) cart', async () => {
      const cart = createMockCart({ items: [] });
      cartRepository.removeItem.mockResolvedValue(cart);
      productService.findByIds.mockResolvedValue([]);

      const result = await service.removeItem('user-1', 'product-1');

      expect(cartRepository.removeItem).toHaveBeenCalledWith(
        'user-1',
        'product-1',
      );
      expect(productService.findByIds).toHaveBeenCalledWith([]);
      expect(result.items).toEqual([]);
    });
  });

  describe('clear', () => {
    it('delegates to cartRepository.clear without resolving any products', async () => {
      await service.clear('user-1');

      expect(cartRepository.clear).toHaveBeenCalledWith('user-1');
      expect(productService.findByIds).not.toHaveBeenCalled();
    });
  });

  describe('getRawItems', () => {
    it('returns only productId/quantity pairs, without hitting productService', async () => {
      const cart = createMockCart({
        items: [
          createMockCartItem({ productId: 'product-1', quantity: 2 }),
          createMockCartItem({ productId: 'product-2', quantity: 3 }),
        ],
      });
      cartRepository.getOrCreate.mockResolvedValue(cart);

      const result = await service.getRawItems('user-1');

      expect(cartRepository.getOrCreate).toHaveBeenCalledWith('user-1');
      expect(result).toEqual([
        { productId: 'product-1', quantity: 2 },
        { productId: 'product-2', quantity: 3 },
      ]);
      expect(productService.findByIds).not.toHaveBeenCalled();
    });

    it('returns an empty array for an empty cart', async () => {
      cartRepository.getOrCreate.mockResolvedValue(
        createMockCart({ items: [] }),
      );

      const result = await service.getRawItems('user-1');

      expect(result).toEqual([]);
    });
  });
});
