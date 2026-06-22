import { ORDER_REPOSITORY } from '@modules/order/domain/interfaces/order-repository.interface';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@shared/prisma';

import { OrderService } from './order.service';

describe('OrderService', () => {
  let service: OrderService;

  const repo = {
    create: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    updateStatus: jest.fn(),
  };

  const prisma = {
    product: {
      findMany: jest.fn(),
    },
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

  it('findById not found', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(
      service.findById('1', { userId: '1', role: 'USER' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('cancel forbidden', async () => {
    repo.findById.mockResolvedValue({
      canBeCancelled: () => false,
      status: 'DELIVERED',
      isOwnerById: () => true,
    });

    await expect(
      service.cancel('1', { userId: '1', role: 'USER' }),
    ).rejects.toThrow(ForbiddenException);
  });
});
