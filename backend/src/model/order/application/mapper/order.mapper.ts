import { OrderResponse } from '@/model/order/application/dto';
import type { OrderEntity } from '@/model/order/domain/entities';

export class OrderMapper {
  static toResponse(entity: OrderEntity): OrderResponse {
    return new OrderResponse({
      id: entity.id,
      status: entity.status,
      userId: entity.userId,
      items: entity.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        subTotal: item.subTotal,
      })),
      total: entity.total,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toResponseList(entities: OrderEntity[]): OrderResponse[] {
    return entities.map((entity) => OrderMapper.toResponse(entity));
  }
}
