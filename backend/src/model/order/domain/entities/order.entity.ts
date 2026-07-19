import { OrderStatus } from '@/generated/prisma/client';
import { OrderItemEntity } from '@/model/order/domain/entities/order-item.entity';

export class OrderEntity {
  readonly id: string;
  readonly status: OrderStatus;
  readonly items: OrderItemEntity[];
  readonly userId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  constructor(props: {
    id: string;
    status: OrderStatus;
    items: OrderItemEntity[];
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.status = props.status;
    this.userId = props.userId;
    this.items = props.items;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  private static readonly transitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
    [OrderStatus.PAID]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.COMPLETED],
    [OrderStatus.COMPLETED]: [],
    [OrderStatus.CANCELLED]: [],
  };

  canTransitionTo(next: OrderStatus): boolean {
    return OrderEntity.transitions[this.status].includes(next);
  }

  canBeCancelled(): boolean {
    return this.canTransitionTo(OrderStatus.CANCELLED);
  }

  isOwnerById(userId: string): boolean {
    return this.userId === userId;
  }

  get total() {
    return this.items.reduce((sum, item) => sum + item.subTotal, 0);
  }

  static fromPersistence(raw: {
    id: string;
    status: string;
    userId: string;
    items: {
      id: string;
      quantity: number;
      price: number;
      productId: string;
      orderId: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
  }): OrderEntity {
    return new OrderEntity({
      ...raw,
      status: raw.status as OrderStatus,
      items: raw.items.map((item) => OrderItemEntity.fromPersistence(item)),
    });
  }
}
