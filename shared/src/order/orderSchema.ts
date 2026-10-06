import { z } from "zod";
import { ORDER_STATUS } from "../enums";
import {
  BaseQuerySchema,
  DateRangeSchema,
  isValidDateRange,
  dateRangeError,
} from "../pagination/paginationSchema";

export const CreateOrderItemSchema = z.object({
  productId: z.uuid({ error: "Invalid product id" }),
  quantity: z.number().int().min(1, { error: "Quantity must be at least 1" }),
});

export const CreateOrderSchema = z.object({
  items: z
    .array(CreateOrderItemSchema, { error: "Items must be an array" })
    .min(1, { error: "Order must contain at least one item" }),
});

export const OrderQuerySchema = BaseQuerySchema.extend({
  userId: z.uuid({ error: "Invalid user id" }).optional(),
  status: z.enum(ORDER_STATUS, { error: "Invalid order status" }).optional(),
  ...DateRangeSchema.shape,
}).refine(isValidDateRange, dateRangeError);

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUS, { error: "Invalid order status" }),
});

export type OrderQueryInput = z.infer<typeof OrderQuerySchema>;
export type CreateOrderItemInput = z.infer<typeof CreateOrderItemSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
