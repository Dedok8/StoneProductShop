import { OrderStatus } from '@/generated/prisma/client';
import { OrderResponse } from '@/model/order/application/dto';
import { OrderMapper } from '@/model/order/application/mapper';
import { OrderEntity, OrderItemEntity } from '@/model/order/domain/entities';

describe('OrderMapper', () => {
  const mockDate = new Date();

  const createMockOrder = (): OrderEntity => {
    const item = new OrderItemEntity({
      id: 'item-1',
      quantity: 2,
      price: 100,
      productId: 'product-1',
      orderId: 'order-1',
    });

    return new OrderEntity({
      id: 'order-1',
      status: OrderStatus.PENDING,
      userId: 'user-1',
      items: [item],
      createdAt: mockDate,
      updatedAt: mockDate,
    });
  };

  describe('toResponse', () => {
    it('should transform OrderEntity into OrderResponse instance with correct calculated total', () => {
      const entity = createMockOrder();

      const result = OrderMapper.toResponse(entity);

      expect(result).toBeInstanceOf(OrderResponse);

      expect(result.id).toBe('order-1');
      expect(result.status).toBe(OrderStatus.PENDING);
      expect(result.userId).toBe('user-1');
      expect(result.createdAt).toBe(mockDate);
      expect(result.updatedAt).toBe(mockDate);

      expect(result.total).toBe(200);

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual(
        expect.objectContaining({
          id: 'item-1',
          productId: 'product-1',
          quantity: 2,
          price: 100,
          subTotal: 200,
        }),
      );
    });
  });

  describe('toResponseList', () => {
    it('should transform an array of OrderEntity into an array of OrderResponse instances', () => {
      const entity = createMockOrder();

      const result = OrderMapper.toResponseList([entity]);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(OrderResponse);
      expect(result[0].id).toBe('order-1');
      expect(result[0].total).toBe(200);
    });
  });
});
