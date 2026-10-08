import { ORDER_STATUS } from '@stone-shop/shared';

import { OrderItemEntity } from '@/model/order/domain/entities/order-item.entity';
export class OrderEntity {
  readonly id: string;
  readonly status: ORDER_STATUS;
  readonly items: OrderItemEntity[];
  readonly userId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  constructor(props: {
    id: string;
    status: ORDER_STATUS;
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

  private static readonly transitions: Record<ORDER_STATUS, ORDER_STATUS[]> = {
    [ORDER_STATUS.PENDING]: [ORDER_STATUS.PAID, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.PAID]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.COMPLETED],
    [ORDER_STATUS.COMPLETED]: [],
    [ORDER_STATUS.CANCELLED]: [],
  };

  canTransitionTo(next: ORDER_STATUS): boolean {
    return OrderEntity.transitions[this.status].includes(next);
  }

  canBeCancelled(): boolean {
    return this.canTransitionTo(ORDER_STATUS.CANCELLED);
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
      status: raw.status as ORDER_STATUS,
      items: raw.items.map((item) => OrderItemEntity.fromPersistence(item)),
    });
  }
}
