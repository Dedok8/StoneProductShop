import {
  CreateOrderItemSchema,
  CreateOrderSchema,
  OrderQuerySchema,
  UpdateOrderStatusSchema,
} from '@stone-shop/shared';
import { createZodDto } from 'nestjs-zod';

export class OrderQueryDto extends createZodDto(OrderQuerySchema) {}
export class CreateOrderItemDto extends createZodDto(CreateOrderItemSchema) {}
export class CreateOrderDto extends createZodDto(CreateOrderSchema) {}
export class UpdateOrderStatusDto extends createZodDto(
  UpdateOrderStatusSchema,
) {}
