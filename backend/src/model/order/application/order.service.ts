import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { OrderStatus } from '@/generated/prisma/client';
import {
  CreateOrderDto,
  OrderQueryDto,
  PaginatedOrderResponseDto,
} from '@/model/order/application/dto';
import { OrderMapper } from '@/model/order/application/mapper';
import {
  type IOrderRepository,
  ORDER_REPOSITORY,
} from '@/model/order/domain/interfaces';
import { PaginationMetaDto } from '@/shared';

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async findById(id: string, userId?: string) {
    const order = await this.orderRepository.findById(id);

    if (!order) throw new NotFoundException('Order not found');

    if (userId && !order.isOwnerById(userId)) {
      throw new NotFoundException('Order not found');
    }

    return OrderMapper.toResponse(order);
  }

  async findAll(query: OrderQueryDto): Promise<PaginatedOrderResponseDto> {
    const { items, total } = await this.orderRepository.findAll(query);

    return new PaginatedOrderResponseDto({
      items: OrderMapper.toResponseList(items),
      meta: new PaginationMetaDto({
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        total,
      }),
    });
  }

  async create(userId: string, dto: CreateOrderDto) {
    const created = await this.orderRepository.create({
      userId,
      items: dto.items,
    });

    return OrderMapper.toResponse(created);
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.orderRepository.findById(id);

    if (!order) throw new NotFoundException('Order not found');

    if (!order.canTransitionTo(status)) {
      throw new BadRequestException(
        `Cannot transition order from "${order.status}" to "${status}"`,
      );
    }

    const updated = await this.orderRepository.updateStatus(id, status);

    if (!updated) throw new NotFoundException('Order not found');

    return OrderMapper.toResponse(updated);
  }
}
