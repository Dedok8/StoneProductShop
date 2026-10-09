import { z } from "zod";
import { slugSchema } from "../common/slugSchema";

export const CreateProductTypeSchema = z.object({
  name: z
    .string({ error: "validation.string" })
    .trim()
    .min(1, { error: "validation.productType.name.required" })
    .max(100, { error: "validation.productType.name.max" }),

  slug: slugSchema,
});

export const UpdateProductTypeSchema = CreateProductTypeSchema.partial().refine(
  (v) => Object.keys(v).length > 0,
  { error: "validation.atLeastOneField" },
);

export type CreateProductTypeInput = z.infer<typeof CreateProductTypeSchema>;
export type UpdateProductTypeInput = z.infer<typeof UpdateProductTypeSchema>;
