import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { OrderItem, Prisma } from '@/generated/prisma/client';
import type { OrderStatus } from '@/generated/prisma/enums';
import { OrderEntity } from '@/model/order/domain/entities';
import type {
  ICreateOrderData,
  IOrderFindAllResult,
  IOrderQuery,
  IOrderRepository,
} from '@/model/order/domain/interfaces';
import { updateOrNotFound, PrismaService } from '@/shared';

type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

export class InsufficientStockError extends ConflictException {
  constructor(productId: string, available: number, requested: number) {
    super(
      `Insufficient stock for product ${productId}: available ${available}, requested ${requested}`,
    );
  }
}

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<OrderEntity | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    return order ? this.mapToEntity(order) : null;
  }

  async findAll(query: IOrderQuery): Promise<IOrderFindAllResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.OrderWhereInput = {
      userId: query.userId ?? undefined,
      status: query.status ?? undefined,

      createdAt:
        query.dateFrom || query.dateTo
          ? {
              gte: query.dateFrom ?? undefined,
              lte: query.dateTo ?? undefined,
            }
          : undefined,
    };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: query.sortOrder ?? 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items: orders.map((order) => this.mapToEntity(order)),
      total,
    };
  }

  async create(data: ICreateOrderData): Promise<OrderEntity> {
    const created = await this.prisma.$transaction(async (tx) => {
      const productIds = data.items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      for (const item of data.items) {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }
      }

      for (const item of data.items) {
        const result = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (result.count === 0) {
          const product = productMap.get(item.productId)!;
          throw new InsufficientStockError(
            item.productId,
            product.stock,
            item.quantity,
          );
        }
      }

      return tx.order.create({
        data: {
          userId: data.userId,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: productMap.get(item.productId)!.price,
            })),
          },
        },
        include: { items: true },
      });
    });

    return this.mapToEntity(created);
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
  ): Promise<OrderEntity | null> {
    return updateOrNotFound({
      updateFn: async () => {
        const updated = await this.prisma.order.update({
          where: { id },
          data: { status },
          include: { items: true },
        });

        return {
          ...updated,
          items: updated.items.map((item) => ({
            ...item,
            price: item.price.toNumber(),
          })),
        };
      },
      entityClass: OrderEntity,
    });
  }

  private mapToEntity(order: OrderWithItems): OrderEntity {
    return OrderEntity.fromPersistence({
      ...order,
      items: order.items.map((item: OrderItem) => ({
        ...item,
        price: item.price.toNumber(),
      })),
    });
  }
}
