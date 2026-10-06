import { z } from "zod";
import { LEAD_STATUS, SORT_ORDER } from "../enums";

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const BaseQuerySchema = PaginationSchema.extend({
  search: z.string().trim().optional(),
  sortOrder: z.enum(SORT_ORDER).default(SORT_ORDER.ASC),
});

export const DateRangeSchema = z.object({
  dateFrom: z.iso.date().optional(),
  dateTo: z.iso.date().optional(),
});

export const isValidDateRange = (q: { dateFrom?: string; dateTo?: string }) =>
  !q.dateFrom || !q.dateTo || q.dateFrom <= q.dateTo;

export const dateRangeError = {
  error: "dateFrom must be before dateTo",
  path: ["dateFrom"],
};

export const LeadQuerySchema = BaseQuerySchema.extend({
  status: z.enum(LEAD_STATUS).optional(),
  ...DateRangeSchema.shape,
}).refine(isValidDateRange, dateRangeError);

export type PaginationInput = z.infer<typeof PaginationSchema>;
export type BaseQueryInput = z.infer<typeof BaseQuerySchema>;
export type LeadQueryInput = z.infer<typeof LeadQuerySchema>;
