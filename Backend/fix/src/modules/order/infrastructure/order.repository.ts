import { OrderEntity, OrderStatus } from '@modules/order/domain';
import {
  ICreateOrderData,
  IFindManyOrdersParams,
  IOrderRepository,
} from '@modules/order/domain/interfaces/order-repository.interface';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: ICreateOrderData): Promise<OrderEntity> {
    const created = await this.prisma.$transaction(async (tx) => {
      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new BadRequestException(
            `Product with id "${item.productId}" not found`,
          );
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Not enough stock for product "${product.name}"`,
          );
        }
      }

      const order = await tx.order.create({
        data: {
          userId: data.userId,
          status: OrderStatus.PENDING,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return order;
    });

    return this.toEntity(created);
  }

  async findById(id: string): Promise<OrderEntity | null> {
    const found = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    return found ? this.toEntity(found) : null;
  }

  async findMany(
    params: IFindManyOrdersParams,
  ): Promise<{ items: OrderEntity[]; total: number }> {
    const where = {
      ...(params.userId && { userId: params.userId }),
      ...(params.status && { status: params.status }),
    };

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: { items: true },
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items: orders.map((order) => this.toEntity(order)), total };
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderEntity> {
    const updated = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    return this.toEntity(updated);
  }

  private toEntity(raw: {
    id: string;
    status: string;
    userId: string;
    items: {
      id: string;
      quantity: number;
      price: { toNumber(): number } | number;
      productId: string;
      orderId: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
  }): OrderEntity {
    return OrderEntity.fromPersistence({
      ...raw,
      items: raw.items.map((item) => ({
        ...item,
        price:
          typeof item.price === 'number' ? item.price : item.price.toNumber(),
      })),
    });
  }
}
