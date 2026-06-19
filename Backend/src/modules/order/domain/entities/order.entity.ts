import { OrderItemEntity } from '@modules/order/domain/entities/order-item.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class OrderEntity {
  readonly id: string;
  readonly status: OrderStatus;
  readonly userId: string;
  readonly items: OrderItemEntity[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: {
    id: string;
    status: OrderStatus;
    userId: string;
    items: OrderItemEntity[];
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

  get total() {
    return this.items.reduce((sum, item) => sum + item.subTotal, 0);
  }

  isOwnerBy(userId: string): boolean {
    return this.userId === userId;
  }

  canBeCancelled(): boolean {
    return this.status === OrderStatus.PENDING;
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
