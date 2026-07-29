import { ConflictException, Injectable } from '@nestjs/common';

import { CartItem, Prisma } from '@/generated/prisma';
import { CartEntity, ICartRepository } from '@/model/cart/domain';
import { PrismaService } from '@/shared';

type CartWithItems = Prisma.CartGetPayload<{ include: { items: true } }>;

export class ProductNotFoundError extends ConflictException {
  constructor(productId: string) {
    super(`Product ${productId} not found`);
  }
}

@Injectable()
export class CartRepository implements ICartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<CartEntity | null> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    return cart ? this.mapToEntity(cart) : null;
  }
  async getOrCreate(userId: string): Promise<CartEntity> {
    const cart = await this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: { items: true },
    });

    return this.mapToEntity(cart);
  }
  async addItem(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<CartEntity> {
    const updated = await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new ProductNotFoundError(productId);

      const cart = await tx.cart.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });

      await tx.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId } },
        create: { cartId: cart.id, productId, quantity },
        update: { quantity: { increment: quantity } },
      });

      return tx.cart.findUniqueOrThrow({
        where: { id: cart.id },
        include: { items: true },
      });
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

    const updated = await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });

      await tx.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId } },
        create: { cartId: cart.id, productId, quantity },
        update: { quantity },
      });

      return tx.cart.findUniqueOrThrow({
        where: { id: cart.id },
        include: { items: true },
      });
    });

    return this.mapToEntity(updated);
  }
  async removeItem(userId: string, productId: string): Promise<CartEntity> {
    const updated = await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id, productId } });

      return tx.cart.findUniqueOrThrow({
        where: { id: cart.id },
        include: { items: true },
      });
    });

    return this.mapToEntity(updated);
  }

  async clear(userId: string): Promise<void> {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) return;

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  private mapToEntity(cart: CartWithItems): CartEntity {
    return CartEntity.fromPersistence({
      ...cart,
      items: cart.items.map((item: CartItem) => ({ ...item })),
    });
  }
}
