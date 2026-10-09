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
    .string({ error: "validation.string" })
    .trim()
    .min(1, { error: "validation.lead.name.required" })
    .max(100, { error: "validation.lead.name.max" }),
  phone: z
    .string({ error: "validation.string" })
    .transform((v) => v.replace(/[\s()-]/g, ""))
    .pipe(z.e164({ error: "validation.lead.phone.invalid" })),
  consent: z.literal(true, { error: "validation.lead.consent.required" }),
});

export const LeadQuerySchema = BaseQuerySchema.extend({
  status: z
    .enum(LEAD_STATUS, { error: "validation.lead.status.invalid" })
    .optional(),
  ...DateRangeSchema.shape,
}).refine(isValidDateRange, dateRangeError);

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;
export type LeadQueryInput = z.infer<typeof LeadQuerySchema>;
