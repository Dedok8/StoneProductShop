import { randomUUID } from 'node:crypto';

import type { Prisma } from '@/generated/prisma/client';
import { OrderStatus } from '@/generated/prisma/enums';
import type { PrismaService } from '@/shared';

export interface OrderFixtureItem {
  productId: string;
  quantity: number;
}

export interface OrderFixtureOverrides {
  id?: string;
  status?: OrderStatus;
}

export class OrderFixture {
  constructor(private readonly prisma: PrismaService) {}


  async create(
    userId: string,
    items: OrderFixtureItem[],
    overrides: OrderFixtureOverrides = {},
  ): Promise<Prisma.OrderGetPayload<{ include: { items: true } }>> {
    if (!userId) {
      throw new Error('OrderFixture: userId is required to create an order');
    }
    if (items.length === 0) {
      throw new Error('OrderFixture: at least one item is required');
    }

    const productIds = items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const priceMap = new Map(products.map((p) => [p.id, p.price]));

    for (const item of items) {
      if (!priceMap.has(item.productId)) {
        throw new Error(
          `OrderFixture: Product with ID ${item.productId} not found in DB`,
        );
      }
    }

    return this.prisma.order.create({
      data: {
        id: overrides.id ?? randomUUID(),
        userId,
        status: overrides.status ?? OrderStatus.PENDING,
        items: {
          create: items.map((item) => ({
            id: randomUUID(),
            productId: item.productId,
            quantity: item.quantity,
            price: priceMap.get(item.productId)!,
          })),
        },
      },
      include: { items: true },
    });
  }
}
