import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import {
  CartRepository,
  ProductNotFoundError,
} from '@/model/cart/infrastructure/cart.repository';
import { PrismaService } from '@/shared';

describe('CartRepository', () => {
  let repository: CartRepository;

  const mockDate = new Date('2026-01-01T00:00:00.000Z');

  const prisma = {
    cart: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    cartItem: {
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma.$transaction.mockImplementation(
      async (cb: (tx: typeof prisma) => Promise<unknown>) => cb(prisma),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [CartRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repository = module.get(CartRepository);
  });

  describe('findByUserId', () => {
    it('returns the cart with its items when found', async () => {
      prisma.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        userId: 'user-1',
        items: [{ productId: 'product-1', quantity: 2 }],
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      const result = await repository.findByUserId('user-1');

      expect(prisma.cart.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: { items: true },
      });
      expect(result?.id).toBe('cart-1');
      expect(result?.items).toHaveLength(1);
    });

    it('returns null when no cart exists for the user', async () => {
      prisma.cart.findUnique.mockResolvedValue(null);

      const result = await repository.findByUserId('user-1');

      expect(result).toBeNull();
    });
  });

  describe('getOrCreate', () => {
    it('upserts the cart and returns it mapped to an entity', async () => {
      prisma.cart.upsert.mockResolvedValue({
        id: 'cart-1',
        userId: 'user-1',
        items: [],
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      const result = await repository.getOrCreate('user-1');

      expect(prisma.cart.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        create: { userId: 'user-1' },
        update: {},
        include: { items: true },
      });
      expect(result.userId).toBe('user-1');
      expect(result.items).toEqual([]);
    });
  });

  describe('addItem', () => {
    it('adds the item (incrementing quantity) and returns the updated cart', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: 'product-1' });
      prisma.cart.upsert.mockResolvedValue({ id: 'cart-1' });
      prisma.cartItem.upsert.mockResolvedValue({});
      prisma.cart.findUniqueOrThrow.mockResolvedValue({
        id: 'cart-1',
        userId: 'user-1',
        items: [{ productId: 'product-1', quantity: 2 }],
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      const result = await repository.addItem('user-1', 'product-1', 2);

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product-1' },
      });
      expect(prisma.cartItem.upsert).toHaveBeenCalledWith({
        where: {
          cartId_productId: { cartId: 'cart-1', productId: 'product-1' },
        },
        create: { cartId: 'cart-1', productId: 'product-1', quantity: 2 },
        update: { quantity: { increment: 2 } },
      });
      expect(result.items).toHaveLength(1);
    });

    it('throws ProductNotFoundError and touches nothing else if the product does not exist', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        repository.addItem('user-1', 'missing-product', 2),
      ).rejects.toThrow(ProductNotFoundError);

      expect(prisma.cart.upsert).not.toHaveBeenCalled();
      expect(prisma.cartItem.upsert).not.toHaveBeenCalled();
    });
  });

  describe('setItemQuantity', () => {
    it('sets the exact quantity when the new quantity is positive', async () => {
      prisma.cart.upsert.mockResolvedValue({ id: 'cart-1' });
      prisma.cartItem.upsert.mockResolvedValue({});
      prisma.cart.findUniqueOrThrow.mockResolvedValue({
        id: 'cart-1',
        userId: 'user-1',
        items: [{ productId: 'product-1', quantity: 5 }],
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      const result = await repository.setItemQuantity('user-1', 'product-1', 5);

      expect(prisma.cartItem.upsert).toHaveBeenCalledWith({
        where: {
          cartId_productId: { cartId: 'cart-1', productId: 'product-1' },
        },
        create: { cartId: 'cart-1', productId: 'product-1', quantity: 5 },
        update: { quantity: 5 },
      });
      expect(result.items[0].quantity).toBe(5);
    });

    it('delegates to removeItem (deletes the row) when the quantity is zero', async () => {
      prisma.cart.upsert.mockResolvedValue({ id: 'cart-1' });
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
      prisma.cart.findUniqueOrThrow.mockResolvedValue({
        id: 'cart-1',
        userId: 'user-1',
        items: [],
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      await repository.setItemQuantity('user-1', 'product-1', 0);

      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: 'cart-1', productId: 'product-1' },
      });
      expect(prisma.cartItem.upsert).not.toHaveBeenCalled();
    });

    it('delegates to removeItem when the quantity is negative', async () => {
      prisma.cart.upsert.mockResolvedValue({ id: 'cart-1' });
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
      prisma.cart.findUniqueOrThrow.mockResolvedValue({
        id: 'cart-1',
        userId: 'user-1',
        items: [],
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      await repository.setItemQuantity('user-1', 'product-1', -3);

      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: 'cart-1', productId: 'product-1' },
      });
      expect(prisma.cartItem.upsert).not.toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('deletes the item and returns the updated cart', async () => {
      prisma.cart.upsert.mockResolvedValue({ id: 'cart-1' });
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
      prisma.cart.findUniqueOrThrow.mockResolvedValue({
        id: 'cart-1',
        userId: 'user-1',
        items: [],
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      const result = await repository.removeItem('user-1', 'product-1');

      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: 'cart-1', productId: 'product-1' },
      });
      expect(result.items).toEqual([]);
    });
  });

  describe('clear', () => {
    it('deletes all items when the cart exists', async () => {
      prisma.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        userId: 'user-1',
      });

      await repository.clear('user-1');

      expect(prisma.cart.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: 'cart-1' },
      });
    });

    it('does nothing when no cart exists for the user', async () => {
      prisma.cart.findUnique.mockResolvedValue(null);

      await repository.clear('user-1');

      expect(prisma.cartItem.deleteMany).not.toHaveBeenCalled();
    });
  });
});
