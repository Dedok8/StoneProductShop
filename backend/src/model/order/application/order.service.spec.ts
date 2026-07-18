import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { MockProxy } from 'jest-mock-extended';
import { mock } from 'jest-mock-extended';

import { OrderStatus } from '@/generated/prisma/enums';
import { OrderService } from '@/model/order/application';
import type { OrderQueryDto } from '@/model/order/application/dto';
import { OrderEntity, OrderItemEntity } from '@/model/order/domain/entities';
import type { IOrderRepository } from '@/model/order/domain/interfaces';

const makeOrderItem = (
  overrides: Partial<ConstructorParameters<typeof OrderItemEntity>[0]> = {},
): OrderItemEntity =>
  new OrderItemEntity({
    id: 'item-1',
    quantity: 2,
    price: 15000,
    productId: 'product-1',
    orderId: 'order-1',
    ...overrides,
  });

const makeOrder = (
  overrides: Partial<{
    id: string;
    status: OrderStatus;
    items: OrderItemEntity[];
    userId: string;
  }> = {},
): OrderEntity =>
  new OrderEntity({
    id: 'order-1',
    status: OrderStatus.PENDING,
    items: [makeOrderItem()],
    userId: 'user-1',
    createdAt: new Date('2026-07-15'),
    updatedAt: new Date('2026-07-15'),
    ...overrides,
  });

describe('orderService', () => {
  let service: OrderService;
  let repository: MockProxy<IOrderRepository>;

  beforeEach(() => {
    repository = mock<IOrderRepository>();
    service = new OrderService(repository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('findById', () => {
    it('returns the order if it is found and the userId is not provided (administrator access)', async () => {
      const order = makeOrder();
      repository.findById.mockResolvedValue(order);

      const result = await service.findById('order-1');

      expect(result.id).toBe('order-1');
      expect(result.total).toBe(30000);
    });

    it('returns the order if the userId matches the owners', async () => {
      const order = makeOrder({ userId: 'user-1' });
      repository.findById.mockResolvedValue(order);

      const result = await service.findById('order-1', 'user-1');

      expect(result.userId).toBe('user-1');
    });

    it('throws a NotFoundException if the order is not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws a NotFoundException if the userId does not match the owner (attempt to pass off someone else order as your own)', async () => {
      const order = makeOrder({ userId: 'owner-A' });
      repository.findById.mockResolvedValue(order);

      await expect(service.findById('order-1', 'someone-else')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('returns a paginated list of orders', async () => {
      repository.findAll.mockResolvedValue({
        items: [makeOrder(), makeOrder({ id: 'order-2' })],
        total: 2,
      });
      const query: OrderQueryDto = { page: 1, limit: 20 };

      const result = await service.findAll(query);

      expect(repository.findAll).toHaveBeenCalledWith(query);
      expect(result.items).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('sets the default page/limit values if the query does not include them', async () => {
      repository.findAll.mockResolvedValue({ items: [], total: 0 });

      const result = await service.findAll({});

      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
    });
  });

  describe('create', () => {
    it('creates an order for the user with the specified items', async () => {
      const dto = { items: [{ productId: 'prod-1', quantity: 2 }] };
      repository.create.mockResolvedValue(makeOrder());

      const result = await service.create('user-1', dto);

      expect(repository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        items: dto.items,
      });
      expect(result.id).toBe('order-1');
    });
  });

  describe('updateStatus', () => {
    it('changes the order status from PENDING to PAID (allowed transition)', async () => {
      repository.findById.mockResolvedValue(
        makeOrder({ status: OrderStatus.PENDING }),
      );
      repository.updateStatus.mockResolvedValue(
        makeOrder({ status: OrderStatus.PAID }),
      );

      const result = await service.updateStatus('order-1', OrderStatus.PAID);

      expect(repository.updateStatus).toHaveBeenCalledWith(
        'order-1',
        OrderStatus.PAID,
      );
      expect(result.status).toBe(OrderStatus.PAID);
    });

    it('changes the order status from PENDING to CANCELLED (allowed transition)', async () => {
      repository.findById.mockResolvedValue(
        makeOrder({ status: OrderStatus.PENDING }),
      );
      repository.updateStatus.mockResolvedValue(
        makeOrder({ status: OrderStatus.CANCELLED }),
      );

      const result = await service.updateStatus(
        'order-1',
        OrderStatus.CANCELLED,
      );

      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('throws a BadRequestException if an invalid transition occurs (PENDING → SHIPPED)', async () => {
      repository.findById.mockResolvedValue(
        makeOrder({ status: OrderStatus.PENDING }),
      );

      await expect(
        service.updateStatus('order-1', OrderStatus.SHIPPED),
      ).rejects.toThrow(BadRequestException);
      expect(repository.updateStatus).not.toHaveBeenCalled();
    });

    it('throws a BadRequestException when attempting to change the status of a completed order', async () => {
      repository.findById.mockResolvedValue(
        makeOrder({ status: OrderStatus.COMPLETED }),
      );

      await expect(
        service.updateStatus('order-1', OrderStatus.CANCELLED),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws a BadRequestException when attempting to change the status of a canceled order', async () => {
      repository.findById.mockResolvedValue(
        makeOrder({ status: OrderStatus.CANCELLED }),
      );

      await expect(
        service.updateStatus('order-1', OrderStatus.PAID),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws a NotFoundException if the order is not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.updateStatus('missing', OrderStatus.PAID),
      ).rejects.toThrow(NotFoundException);
      expect(repository.updateStatus).not.toHaveBeenCalled();
    });

    it('throws a NotFoundException if the order disappears between `findById` and `updateStatus` (race condition)', async () => {
      repository.findById.mockResolvedValue(
        makeOrder({ status: OrderStatus.PENDING }),
      );
      repository.updateStatus.mockResolvedValue(null);

      await expect(
        service.updateStatus('order-1', OrderStatus.PAID),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
