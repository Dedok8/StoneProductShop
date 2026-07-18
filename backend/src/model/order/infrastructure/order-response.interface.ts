import type { OrderStatus } from '@/generated/prisma/enums';

export interface OrderResponseDto {
  id: string;
  status: OrderStatus;
  userId: string;
  items: {
    id: string;
    productId: string;
    quantity: number;
    price: number | string;
  }[];
  total?: number;
  createdAt: Date;
  updatedAt: Date;
}
