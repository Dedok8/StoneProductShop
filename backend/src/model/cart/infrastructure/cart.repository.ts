import { ConflictException, Injectable } from '@nestjs/common';

import { CartItem, Prisma } from '@/generated/prisma';
import { CartEntity, ICartRepository } from '@/model/cart/domain';
import { PrismaService } from '@/shared';

type CartWithItems = Prisma.CartGetPayload<{
  include: { items: true };
}>;

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
      where: {
        userId,
      },
      include: {
        items: true,
      },
    });

    return cart ? this.mapToEntity(cart) : null;
  }

  async getOrCreate(userId: string): Promise<CartEntity> {
    const cart = await this.getOrCreateCart(userId);

    const fullCart = await this.prisma.cart.findUniqueOrThrow({
      where: {
        id: cart.id,
      },
      include: {
        items: true,
      },
    });

    return this.mapToEntity(fullCart);
  }

  async addItem(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<CartEntity> {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new ProductNotFoundError(productId);
    }

    const cart = await this.getOrCreateCart(userId);

    const updated = await this.retry(() =>
      this.prisma.$transaction(async (tx) => {
        await tx.cartItem.upsert({
          where: {
            cartId_productId: {
              cartId: cart.id,
              productId,
            },
          },

          create: {
            cartId: cart.id,
            productId,
            quantity,
          },

          update: {
            quantity: {
              increment: quantity,
            },
          },
        });

        return tx.cart.findUniqueOrThrow({
          where: {
            id: cart.id,
          },
          include: {
            items: true,
          },
        });
      }),
    );

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

    const cart = await this.getOrCreateCart(userId);

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.cartItem.upsert({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },

        create: {
          cartId: cart.id,
          productId,
          quantity,
        },

        update: {
          quantity,
        },
      });

      return tx.cart.findUniqueOrThrow({
        where: {
          id: cart.id,
        },
        include: {
          items: true,
        },
      });
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
        include: {
          items: true,
        },
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
    try {
      return await this.prisma.cart.upsert({
        where: {
          userId,
        },

        create: {
          userId,
        },

        update: {},
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return this.prisma.cart.findUniqueOrThrow({
          where: {
            userId,
          },
        });
      }

      throw error;
    }
  }

  private async retry<T>(fn: () => Promise<T>, attempts = 5): Promise<T> {
    let lastError: unknown;

    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          await new Promise((resolve) => setTimeout(resolve, 20 * (i + 1)));

          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }

  private mapToEntity(cart: CartWithItems): CartEntity {
    return CartEntity.fromPersistence({
      ...cart,

      items: cart.items.map((item: CartItem) => ({
        ...item,
      })),
    });
  }
}
