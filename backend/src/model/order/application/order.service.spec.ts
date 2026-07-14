import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { MockProxy } from 'jest-mock-extended';
import { mock } from 'jest-mock-extended';

import { OrderStatus } from '@/generated/prisma/enums';
import type { OrderQueryDto } from '@/model/order/application/dto';
import { OrderService } from '@/model/order/application/order.service';
import { OrderEntity, OrderItemEntity } from '@/model/order/domain/entities';
import type { IOrderRepository } from '@/model/order/domain/interfaces';

const makeOrderItem = (
  overrides: Partial<ConstructorParameters<typeof OrderItemEntity>[0]> = {},
): OrderItemEntity =>
  new OrderItemEntity({
    id: 'item-1',
    quantity: 2,
    price: 15000,
    productId: 'prod-1',
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
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  });

describe('OrderService', () => {
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
    it('возвращает заказ, если он найден и userId не передан (доступ администратора)', async () => {
      const order = makeOrder();
      repository.findById.mockResolvedValue(order);

      const result = await service.findById('order-1');

      expect(result.id).toBe('order-1');
      expect(result.total).toBe(30000);
    });

    it('возвращает заказ, если userId совпадает с владельцем', async () => {
      const order = makeOrder({ userId: 'user-1' });
      repository.findById.mockResolvedValue(order);

      const result = await service.findById('order-1', 'user-1');

      expect(result.userId).toBe('user-1');
    });

    it('выбрасывает NotFoundException, если заказ не найден', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('выбрасывает NotFoundException, если userId не совпадает с владельцем (маскировка чужого заказа)', async () => {
      const order = makeOrder({ userId: 'owner-A' });
      repository.findById.mockResolvedValue(order);

      await expect(service.findById('order-1', 'someone-else')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('возвращает пагинированный список заказов', async () => {
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

    it('подставляет дефолтные page/limit, если query их не содержит', async () => {
      repository.findAll.mockResolvedValue({ items: [], total: 0 });

      const result = await service.findAll({});

      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
    });
  });

  describe('create', () => {
    it('создаёт заказ для пользователя с переданными позициями', async () => {
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
    it('переводит заказ из PENDING в PAID (разрешённый переход)', async () => {
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

    it('переводит заказ из PENDING в CANCELLED (разрешённый переход)', async () => {
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

    it('выбрасывает BadRequestException при недопустимом переходе (PENDING → SHIPPED)', async () => {
      repository.findById.mockResolvedValue(
        makeOrder({ status: OrderStatus.PENDING }),
      );

      await expect(
        service.updateStatus('order-1', OrderStatus.SHIPPED),
      ).rejects.toThrow(BadRequestException);
      expect(repository.updateStatus).not.toHaveBeenCalled();
    });

    it('выбрасывает BadRequestException при попытке изменить статус завершённого заказа', async () => {
      repository.findById.mockResolvedValue(
        makeOrder({ status: OrderStatus.COMPLETED }),
      );

      await expect(
        service.updateStatus('order-1', OrderStatus.CANCELLED),
      ).rejects.toThrow(BadRequestException);
    });

    it('выбрасывает BadRequestException при попытке изменить статус отменённого заказа', async () => {
      repository.findById.mockResolvedValue(
        makeOrder({ status: OrderStatus.CANCELLED }),
      );

      await expect(
        service.updateStatus('order-1', OrderStatus.PAID),
      ).rejects.toThrow(BadRequestException);
    });

    it('выбрасывает NotFoundException, если заказ не найден', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.updateStatus('missing', OrderStatus.PAID),
      ).rejects.toThrow(NotFoundException);
      expect(repository.updateStatus).not.toHaveBeenCalled();
    });

    it('выбрасывает NotFoundException, если заказ исчез между findById и updateStatus (гонка)', async () => {
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
