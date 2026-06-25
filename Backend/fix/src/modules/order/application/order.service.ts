import { CreateOrderDto, OrderQueryDto } from '@modules/order/application/dto';
import { OrderEntity, OrderStatus } from '@modules/order/domain';
import {
  type IOrderRepository,
  ORDER_REPOSITORY,
} from '@modules/order/domain/interfaces/order-repository.interface';
import { UserRole } from '@modules/user/domain';
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@shared/prisma';

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepo: IOrderRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateOrderDto, userId: string): Promise<OrderEntity> {
    const productIds = dto.items.map((item) => item.productId);

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const foundIds = new Set(products.map((p) => p.id));
    const missingIds = productIds.filter((id) => !foundIds.has(id));

    if (missingIds.length > 0) {
      throw new NotFoundException(
        `Products not found: ${missingIds.join(', ')}`,
      );
    }

    const priceMap = new Map(products.map((p) => [p.id, p.price.toNumber()]));

    const items = dto.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: priceMap.get(item.productId)!,
    }));

    return this.orderRepo.create({ userId, items });
  }

  async findById(
    id: string,
    requester: { userId: string; role: string },
  ): Promise<OrderEntity> {
    const order = await this.orderRepo.findById(id);

    if (!order) {
      throw new NotFoundException(`Order with id "${id}" not found`);
    }

    this.assertCanView(order, requester);

    return order;
  }

  async findMyOrders(
    userId: string,
    query: OrderQueryDto,
  ): Promise<{
    items: OrderEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.orderRepo.findMany({
      userId,
      status: query.status,
      skip: query.skip,
      take: query.limit,
    });

    return { ...result, page: query.page, limit: query.limit };
  }

  async findAll(query: OrderQueryDto): Promise<{
    items: OrderEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.orderRepo.findMany({
      status: query.status,
      skip: query.skip,
      take: query.limit,
    });

    return { ...result, page: query.page, limit: query.limit };
  }

  async cancel(
    id: string,
    requester: { userId: string; role: string },
  ): Promise<OrderEntity> {
    const order = await this.orderRepo.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with id "${id}" not found`);
    }

    this.assertCanView(order, requester);

    if (!order.canBeCancelled()) {
      throw new ForbiddenException(
        `Order with status "${order.status}" cannot be cancelled`,
      );
    }

    return this.orderRepo.updateStatus(id, OrderStatus.CANCELLED);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderEntity> {
    const order = await this.orderRepo.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with id "${id}" not found`);
    }

    return this.orderRepo.updateStatus(id, status);
  }

  private assertCanView(
    order: OrderEntity,
    requester: { userId: string; role: string },
  ): void {
    const isAdmin = requester.role === UserRole.ADMIN; // was: 'ADMIN'
    const isOwner = order.isOwnerById(requester.userId);

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('You do not have access to this order');
    }
  }
}
