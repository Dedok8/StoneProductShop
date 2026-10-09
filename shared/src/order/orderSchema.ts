import { z } from "zod";
import { ORDER_STATUS } from "../enums";
import {
  BaseQuerySchema,
  DateRangeSchema,
  isValidDateRange,
  dateRangeError,
} from "../pagination/paginationSchema";

export const CreateOrderItemSchema = z.object({
  productId: z.uuid({ error: "validation.uuid" }),
  quantity: z
    .number({ error: "validation.number" })
    .int({ error: "validation.integer" })
    .min(1, { error: "validation.order.quantity.min" }),
});

export const CreateOrderSchema = z.object({
  items: z
    .array(CreateOrderItemSchema, { error: "validation.order.items.array" })
    .min(1, { error: "validation.order.items.min" }),
});

export const OrderQuerySchema = BaseQuerySchema.extend({
  userId: z.uuid({ error: "validation.uuid" }).optional(),
  status: z
    .enum(ORDER_STATUS, { error: "validation.order.status.invalid" })
    .optional(),
  ...DateRangeSchema.shape,
}).refine(isValidDateRange, dateRangeError);

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUS, { error: "validation.order.status.invalid" }),
});

export type OrderQueryInput = z.infer<typeof OrderQuerySchema>;
export type CreateOrderItemInput = z.infer<typeof CreateOrderItemSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
