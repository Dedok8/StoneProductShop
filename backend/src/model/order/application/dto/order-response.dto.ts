import type { OrderStatus } from '@/generated/prisma/enums';
import { OrderItemResponse } from '@/model/order/application/dto/order-item.response.dto';

export class OrderResponse {
  readonly id: string;
  readonly status: OrderStatus;
  readonly userId: string;
  readonly items: OrderItemResponse[];
  readonly total: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: {
    id: string;
    status: OrderStatus;
    userId: string;
    items: OrderItemResponse[];
    total: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.status = props.status;
    this.userId = props.userId;
    this.items = props.items.map((item) => new OrderItemResponse(item));

    this.total =
      Number(props.total) ||
      props.items.reduce(
        (sum: number, item) => sum + item.quantity * Number(item.price),
        0,
      );

    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
