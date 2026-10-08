import { Injectable } from '@nestjs/common';

import { CartItem, Prisma } from '@/generated/prisma';
import { CartEntity, ICartRepository } from '@/model/cart/domain';
import { PrismaService } from '@/shared';
import { ProductNotFoundError } from '@/shared/error';

type CartWithItems = Prisma.CartGetPayload<{
  include: { items: true };
}>;

@Injectable()
export class CartRepository implements ICartRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly itemsInclude = {
    items: {
      orderBy: { createdAt: 'asc' as const },
    },
  } satisfies Prisma.CartInclude;

  async findByUserId(userId: string): Promise<CartEntity | null> {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
      include: this.itemsInclude,
    });

    return cart ? this.mapToEntity(cart) : null;
  }

  async getOrCreate(userId: string): Promise<CartEntity> {
    const cart = await this.getOrCreateCart(userId);

    const fullCart = await this.prisma.cart.findUniqueOrThrow({
      where: {
        id: cart.id,
      },
      include: this.itemsInclude,
    });

    return this.mapToEntity(fullCart);
  }

  async addItem(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<CartEntity> {
    await this.assertProductExists(productId);

    const cart = await this.getOrCreateCart(userId);

    await this.prisma.cartItem.upsert({
      where: {
        cartId_productId: { cartId: cart.id, productId },
      },
      create: { cartId: cart.id, productId, quantity },
      update: { quantity: { increment: quantity } },
    });

    const updated = await this.prisma.cart.findUniqueOrThrow({
      where: { id: cart.id },
      include: this.itemsInclude,
    });

    return this.mapToEntity(updated);
  }

  async setItemQuantity(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<CartEntity> {
    if (quantity <= 0) {
      return this.removeItem(userId, productId);
    }

    await this.assertProductExists(productId);

    const cart = await this.getOrCreateCart(userId);

    await this.prisma.cartItem.upsert({
      where: {
        cartId_productId: { cartId: cart.id, productId },
      },
      create: { cartId: cart.id, productId, quantity },
      update: { quantity },
    });

    const updated = await this.prisma.cart.findUniqueOrThrow({
      where: { id: cart.id },
      include: this.itemsInclude,
    });

    return this.mapToEntity(updated);
  }

  async removeItem(userId: string, productId: string): Promise<CartEntity> {
    const cart = await this.getOrCreateCart(userId);

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          productId,
        },
      });

      return tx.cart.findUniqueOrThrow({
        where: {
          id: cart.id,
        },
        include: this.itemsInclude,
      });
    });

    return this.mapToEntity(updated);
  }

  async clear(userId: string): Promise<void> {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    if (!cart) {
      return;
    }

    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });
  }

  private async getOrCreateCart(userId: string) {
    return await this.prisma.cart.upsert({
      where: {
        userId,
      },

      create: {
        userId,
      },

      update: {},
    });
  }

  private mapToEntity(cart: CartWithItems): CartEntity {
    return CartEntity.fromPersistence({
      ...cart,

      items: cart.items.map((item: CartItem) => ({
        ...item,
      })),
    });
  }

  private async assertProductExists(productId: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) throw new ProductNotFoundError(productId);
  }
}
