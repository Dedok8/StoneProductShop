import type { MockProxy } from 'jest-mock-extended';
import { mock } from 'jest-mock-extended';

import type { IAccessTokenPayload } from '@/model/auth';
import type {
  CreateOrderDto,
  OrderQueryDto,
  OrderResponse,
  OrderService,
  PaginatedOrderResponseDto,
  UpdateOrderStatusDto,
} from '@/model/order/application';
import { OrderController } from '@/model/order/presentation';
import { UserRole } from '@/shared';

describe('orderController', () => {
  let controller: OrderController;
  let service: MockProxy<OrderService>;

  const mockOrderResponse = { id: 'order-1' } as OrderResponse;
  const mockPaginatedResponse = {
    items: [],
    total: 0,
  } as unknown as PaginatedOrderResponseDto;

  beforeEach(() => {
    service = mock<OrderService>();
    controller = new OrderController(service);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('create', () => {
    it('delegates to orderService.create with the current user id and dto', async () => {
      const dto = {} as CreateOrderDto;
      service.create.mockResolvedValue(mockOrderResponse);

      const result = await controller.create(dto, 'user-1');

      expect(service.create).toHaveBeenCalledWith('user-1', dto);
      expect(result).toBe(mockOrderResponse);
    });
  });

  describe('getMyOrders', () => {
    it('scopes the query to the current user id', async () => {
      const query = { page: 1 } as OrderQueryDto;
      service.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.getMyOrders('user-1', query);

      expect(service.findAll).toHaveBeenCalledWith({
        ...query,
        userId: 'user-1',
      });
      expect(result).toBe(mockPaginatedResponse);
    });
  });

  describe('findById', () => {
    it('passes ownerId=undefined for an ADMIN, so they can view any order', async () => {
      const adminUser = {
        sub: 'admin-1',
        role: UserRole.ADMIN,
      } as IAccessTokenPayload;
      service.findById.mockResolvedValue(mockOrderResponse);

      await controller.findById('order-1', adminUser);

      expect(service.findById).toHaveBeenCalledWith('order-1', undefined);
    });

    it('scopes to the caller for a non-admin, so they cannot view others orders', async () => {
      const customerUser = {
        sub: 'user-1',
        role: UserRole.USER,
      } as IAccessTokenPayload;
      service.findById.mockResolvedValue(mockOrderResponse);

      await controller.findById('order-1', customerUser);

      expect(service.findById).toHaveBeenCalledWith('order-1', 'user-1');
    });

    it('never passes an empty/falsy ownerId for a non-admin', async () => {
      const customerUser = {
        sub: 'user-1',
        role: UserRole.USER,
      } as IAccessTokenPayload;
      service.findById.mockResolvedValue(mockOrderResponse);

      await controller.findById('order-1', customerUser);

      const [, ownerIdArg] = service.findById.mock.calls[0];
      expect(ownerIdArg).toBeTruthy();
    });
  });

  describe('getAll', () => {
    it('passes the raw query through with no userId scoping (admin-only route)', async () => {
      const query = { page: 2 } as OrderQueryDto;
      service.findAll.mockResolvedValue(mockPaginatedResponse);

      await controller.getAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('updateStatus', () => {
    it('delegates to orderService.updateStatus with id and the new status', async () => {
      const dto = { status: 'SHIPPED' } as UpdateOrderStatusDto;
      service.updateStatus.mockResolvedValue(mockOrderResponse);

      const result = await controller.updateStatus('order-1', dto);

      expect(service.updateStatus).toHaveBeenCalledWith('order-1', dto.status);
      expect(result).toBe(mockOrderResponse);
    });
  });
});
