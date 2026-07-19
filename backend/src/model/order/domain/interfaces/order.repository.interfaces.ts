import type { OrderStatus } from '@/generated/prisma/client';
import type { OrderEntity } from '@/model/order/domain/entities';
import type { SortOrder } from '@/shared';

export interface ICreateOrderItemData {
  productId: string;
  quantity: number;

}

export interface ICreateOrderData {
  userId: string;
  items: ICreateOrderItemData[];
}

export interface IOrderFindAllResult {
  items: OrderEntity[];
  total: number;
}

export interface IOrderQuery {
  userId?: string;
  status?: OrderStatus;
  sortOrder?: SortOrder;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export interface IOrderRepository {
  findById(id: string): Promise<OrderEntity | null>;
  findAll(query: IOrderQuery): Promise<IOrderFindAllResult>;
  create(data: ICreateOrderData): Promise<OrderEntity>;
  updateStatus(id: string, status: OrderStatus): Promise<OrderEntity | null>;
}

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');
