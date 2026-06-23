import { OrderService } from '@modules/order/application/order.service';
import { OrderStatus } from '@modules/order/domain';
import { ORDER_REPOSITORY } from '@modules/order/domain/interfaces/order-repository.interface';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@shared/prisma';

// ─── Фабрики ──────────────────────────────────────────────────────────────

const makeOrderItem = (overrides = {}) => ({
  id: 'item-1',
  quantity: 2,
  price: 1500,
  productId: 'prod-1',
  orderId: 'order-1',
  subTotal: 3000,
  ...overrides,
});

const makeOrder = (overrides = {}) => ({
  id: 'order-1',
  status: OrderStatus.PENDING,
  userId: 'user-1',
  items: [makeOrderItem()],
  createdAt: new Date(),
  updatedAt: new Date(),
  total: 3000,
  isOwnerById: (id: string) => id === 'user-1',
  canBeCancelled: () => true,
  ...overrides,
});

const makeRequester = (overrides = {}) => ({
  userId: 'user-1',
  role: 'USER',
  ...overrides,
});

// ─── Тесты ────────────────────────────────────────────────────────────────

describe('OrderService', () => {
  let service: OrderService;

  const repo = {
    create: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    updateStatus: jest.fn(),
  };

  const prisma = {
    product: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: ORDER_REPOSITORY, useValue: repo },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(OrderService);
    jest.clearAllMocks();
  });

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('успешно создаёт заказ с ценами из базы', async () => {
      prisma.product.findMany.mockResolvedValue([
        { id: 'prod-1', price: { toNumber: () => 1500 } },
      ]);
      repo.create.mockResolvedValue(makeOrder());

      const result = await service.create(
        { items: [{ productId: 'prod-1', quantity: 2 }] },
        'user-1',
      );

      expect(result).toBeDefined();
    });

    it('передаёт цены из базы, не из dto', async () => {
      prisma.product.findMany.mockResolvedValue([
        { id: 'prod-1', price: { toNumber: () => 1500 } },
      ]);
      repo.create.mockResolvedValue(makeOrder());

      await service.create(
        { items: [{ productId: 'prod-1', quantity: 2 }] },
        'user-1',
      );

      const [createArg] = repo.create.mock.calls[0] as [
        { items: { price: number }[] },
      ];
      expect(createArg.items[0].price).toBe(1500);
    });

    it('передаёт userId в репозиторий', async () => {
      prisma.product.findMany.mockResolvedValue([
        { id: 'prod-1', price: { toNumber: () => 100 } },
      ]);
      repo.create.mockResolvedValue(makeOrder());

      await service.create(
        { items: [{ productId: 'prod-1', quantity: 1 }] },
        'user-42',
      );

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-42' }),
      );
    });

    it('price 0 если продукт не найден в базе', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      repo.create.mockResolvedValue(makeOrder());

      await service.create(
        { items: [{ productId: 'unknown-prod', quantity: 1 }] },
        'user-1',
      );

      const [createArg] = repo.create.mock.calls[0] as [
        { items: { price: number }[] },
      ];
      expect(createArg.items[0].price).toBe(0);
    });
  });

  // ─── findById ─────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('возвращает заказ владельцу', async () => {
      repo.findById.mockResolvedValue(makeOrder());

      const result = await service.findById('order-1', makeRequester());

      expect(result.id).toBe('order-1');
    });

    it('возвращает заказ администратору (не владелец)', async () => {
      repo.findById.mockResolvedValue(makeOrder({ isOwnerById: () => false }));

      await expect(
        service.findById('order-1', makeRequester({ role: 'ADMIN' })),
      ).resolves.not.toThrow();
    });

    it('NotFoundException если заказ не найден', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findById('ghost', makeRequester())).rejects.toThrow(
        NotFoundException,
      );
    });

    it('ForbiddenException если не владелец и не admin', async () => {
      repo.findById.mockResolvedValue(makeOrder({ isOwnerById: () => false }));

      await expect(
        service.findById('order-1', makeRequester({ userId: 'stranger' })),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── cancel ───────────────────────────────────────────────────────────────

  describe('cancel', () => {
    it('успешно отменяет заказ со статусом PENDING', async () => {
      repo.findById.mockResolvedValue(makeOrder());
      repo.updateStatus.mockResolvedValue(
        makeOrder({ status: OrderStatus.CANCELLED }),
      );

      const result = await service.cancel('order-1', makeRequester());

      expect(repo.updateStatus).toHaveBeenCalledWith(
        'order-1',
        OrderStatus.CANCELLED,
      );
    });

    it('ForbiddenException если заказ нельзя отменить (не PENDING)', async () => {
      repo.findById.mockResolvedValue(
        makeOrder({
          status: OrderStatus.COMPLETED,
          canBeCancelled: () => false,
        }),
      );

      await expect(service.cancel('order-1', makeRequester())).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('NotFoundException если заказ не найден', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.cancel('ghost', makeRequester())).rejects.toThrow(
        NotFoundException,
      );
    });

    it('ForbiddenException если не владелец', async () => {
      repo.findById.mockResolvedValue(makeOrder({ isOwnerById: () => false }));

      await expect(
        service.cancel('order-1', makeRequester({ userId: 'stranger' })),
      ).rejects.toThrow(ForbiddenException);
    });

    it('не вызывает updateStatus при NotFoundException', async () => {
      repo.findById.mockResolvedValue(null);

      await service.cancel('ghost', makeRequester()).catch(() => {});

      expect(repo.updateStatus).not.toHaveBeenCalled();
    });
  });

  // ─── updateStatus (admin) ─────────────────────────────────────────────────

  describe('updateStatus', () => {
    it('успешно меняет статус заказа', async () => {
      repo.findById.mockResolvedValue(makeOrder());
      repo.updateStatus.mockResolvedValue(
        makeOrder({ status: OrderStatus.PAID }),
      );

      const result = await service.updateStatus('order-1', OrderStatus.PAID);

      expect(repo.updateStatus).toHaveBeenCalledWith(
        'order-1',
        OrderStatus.PAID,
      );
    });

    it('NotFoundException если заказ не найден', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.updateStatus('ghost', OrderStatus.PAID),
      ).rejects.toThrow(NotFoundException);
    });

    it('не вызывает updateStatus при NotFoundException', async () => {
      repo.findById.mockResolvedValue(null);

      await service.updateStatus('ghost', OrderStatus.PAID).catch(() => {});

      expect(repo.updateStatus).not.toHaveBeenCalled();
    });
  });

  // ─── findMyOrders ─────────────────────────────────────────────────────────

  describe('findMyOrders', () => {
    it('передаёт userId в репозиторий', async () => {
      repo.findMany.mockResolvedValue({ items: [], total: 0 });

      await service.findMyOrders('user-1', { page: 1, limit: 10, skip: 0 });

      expect(repo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1' }),
      );
    });

    it('возвращает page и limit в ответе', async () => {
      repo.findMany.mockResolvedValue({ items: [], total: 0 });

      const result = await service.findMyOrders('user-1', {
        page: 2,
        limit: 5,
        skip: 5,
      });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
    });
  });
});
