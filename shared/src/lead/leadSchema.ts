import { z } from "zod";
import { LEAD_STATUS } from "../enums";
import {
  BaseQuerySchema,
  DateRangeSchema,
  isValidDateRange,
  dateRangeError,
} from "../pagination/paginationSchema";

export const CreateLeadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Name is required" })
    .max(100, { error: "Name must be at most 100 characters long" }),
  phone: z
    .string()
    .transform((v) => v.replace(/[\s()-]/g, ""))
    .pipe(z.e164({ error: "Invalid phone number" })),
  consent: z.literal(true, { error: "Consent is required" }),
});

export const LeadQuerySchema = BaseQuerySchema.extend({
  status: z.enum(LEAD_STATUS, { error: "Invalid lead status" }).optional(),
  ...DateRangeSchema.shape,
}).refine(isValidDateRange, dateRangeError);

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;
export type LeadQueryInput = z.infer<typeof LeadQuerySchema>;
