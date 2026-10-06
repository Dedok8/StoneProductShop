import { z } from "zod";
import { slugSchema } from "../common/slugSchema";

export const CreateProductTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Name is required" })
    .max(100, { error: "Name must be at most 100 characters long" }),

  slug: slugSchema,
});

export const UpdateProductTypeSchema = CreateProductTypeSchema.partial().refine(
  (v) => Object.keys(v).length > 0,
  { error: "At least one field must be provided" },
);

export type CreateProductTypeInput = z.infer<typeof CreateProductTypeSchema>;
export type UpdateProductTypeInput = z.infer<typeof UpdateProductTypeSchema>;
