import { z } from "zod";
import { SORT_ORDER } from "../enums";

export const PaginationSchema = z.object({
  page: z.coerce
    .number({ error: "validation.number" })
    .int({ error: "validation.integer" })
    .min(1, { error: "validation.pagination.page.min" })
    .default(1),
  limit: z.coerce
    .number({ error: "validation.number" })
    .int({ error: "validation.integer" })
    .min(1, { error: "validation.pagination.limit.min" })
    .max(100, { error: "validation.pagination.limit.max" })
    .default(20),
});

export const BaseQuerySchema = PaginationSchema.extend({
  search: z.string({ error: "validation.string" }).trim().optional(),
  sortOrder: z
    .enum(SORT_ORDER, { error: "validation.pagination.sortOrder.invalid" })
    .default(SORT_ORDER.ASC),
});

export const DateRangeSchema = z.object({
  dateFrom: z.iso
    .date({ error: "validation.dateRange.invalidDate" })
    .optional(),
  dateTo: z.iso.date({ error: "validation.dateRange.invalidDate" }).optional(),
});

export const isValidDateRange = (q: { dateFrom?: string; dateTo?: string }) =>
  !q.dateFrom || !q.dateTo || q.dateFrom <= q.dateTo;

export const dateRangeError = {
  error: "validation.dateRange.order",
  path: ["dateFrom"],
};

export type PaginationInput = z.infer<typeof PaginationSchema>;
export type BaseQueryInput = z.infer<typeof BaseQuerySchema>;
