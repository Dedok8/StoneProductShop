import type { OrderEntity, OrderStatus } from '@modules/order/domain/entities';

export interface ICreateOrderItemData {
  productId: string;
  quantity: number;
  price: number;
}

export interface ICreateOrderData {
  userId: string;
  items: ICreateOrderItemData[];
}

export interface IFindManyOrdersParams {
  skip?: number;
  take?: number;
  userId?: string;
  status?: OrderStatus;
}

export interface IOrderRepository {
  create(data: ICreateOrderData): Promise<OrderEntity>;
  findById(id: string): Promise<OrderEntity | null>;
  findMany(
    params: IFindManyOrdersParams,
  ): Promise<{ items: OrderEntity[]; total: number }>;
  updateStatus(id: string, status: OrderStatus): Promise<OrderEntity>;
}

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');
