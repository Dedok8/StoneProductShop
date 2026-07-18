import { NotFoundException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { Prisma } from '@/generated/prisma/client';
import { OrderStatus } from '@/generated/prisma/enums';
import {
  InsufficientStockError,
  OrderRepository,
} from '@/model/order/infrastructure/order.repository';
import { PrismaService } from '@/shared';

describe('OrderRepository', () => {
  let repository: OrderRepository;

  const prisma = {
    order: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma.$transaction.mockImplementation(
      async (cb: (tx: typeof prisma) => Promise<unknown>) => cb(prisma),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderRepository,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    repository = module.get(OrderRepository);
  });

  describe('findById', () => {
    it('should return order', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: '1',
        items: [{ id: '1', price: { toNumber: () => 100 } }],
      });

      const result = await repository.findById('1');

      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { items: true },
      });
      expect(result?.id).toBe('1');
      expect(result?.items[0].price).toBe(100);
    });

    it('should return null', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      const result = await repository.findById('100');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should load orders from db and apply filters', async () => {
      prisma.order.findMany.mockResolvedValue([{ id: '1', items: [] }]);
      prisma.order.count.mockResolvedValue(1);

      const result = await repository.findAll({
        userId: '2',
        status: OrderStatus.PENDING,
        page: 2,
        limit: 10,
      });

      expect(prisma.order.findMany).toHaveBeenCalled();
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it('should load orders using defaults', async () => {
      prisma.order.findMany.mockResolvedValue([]);
      prisma.order.count.mockResolvedValue(0);

      await repository.findAll({});

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });
  });

  describe('create', () => {
    it('should create order', async () => {
      prisma.product.findMany.mockResolvedValue([
        { id: '1', price: { toNumber: () => 100 }, stock: 5 },
      ]);
      prisma.product.updateMany.mockResolvedValue({ count: 1 });
      prisma.order.create.mockResolvedValue({ id: '1', items: [] });

      const result = await repository.create({
        userId: '2',
        items: [{ productId: '1', quantity: 2 }],
      });

      expect(prisma.product.updateMany).toHaveBeenCalledWith({
        where: { id: '1', stock: { gte: 2 } },
        data: { stock: { decrement: 2 } },
      });
      expect(prisma.order.create).toHaveBeenCalled();
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException on missing product', async () => {
      prisma.product.findMany.mockResolvedValue([]);

      await expect(
        repository.create({
          userId: '2',
          items: [{ productId: '100', quantity: 1 }],
        }),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.product.updateMany).not.toHaveBeenCalled();
      expect(prisma.order.create).not.toHaveBeenCalled();
    });

    it('should throw InsufficientStockError on zero update count', async () => {
      prisma.product.findMany.mockResolvedValue([
        { id: '1', price: { toNumber: () => 100 }, stock: 1 },
      ]);
      prisma.product.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        repository.create({
          userId: '2',
          items: [{ productId: '1', quantity: 5 }],
        }),
      ).rejects.toThrow(InsufficientStockError);

      expect(prisma.order.create).not.toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should update status', async () => {
      prisma.order.update.mockResolvedValue({
        id: '1',
        status: OrderStatus.PAID,
        items: [],
      });

      const result = await repository.updateStatus('1', OrderStatus.PAID);

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: OrderStatus.PAID },
        include: { items: true },
      });
      expect(result?.status).toBe(OrderStatus.PAID);
    });

    it('should return null on missing order (P2025)', async () => {
      prisma.order.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Not found', {
          code: 'P2025',
          clientVersion: '6.0.0',
        }),
      );

      const result = await repository.updateStatus('100', OrderStatus.PAID);

      expect(result).toBeNull();
    });

    it('should rethrow unrelated prisma errors', async () => {
      prisma.order.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Conflict', {
          code: 'P2002',
          clientVersion: '6.0.0',
        }),
      );

      await expect(
        repository.updateStatus('1', OrderStatus.PAID),
      ).rejects.toThrow('Conflict');
    });
  });
});
