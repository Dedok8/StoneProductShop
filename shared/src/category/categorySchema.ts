import { z } from "zod";
import { slugSchema } from "../common/slugSchema";

export const CreateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Name must be at least 2 characters long" })
    .max(50, { error: "Name must be at most 50 characters long" }),

  slug: slugSchema,
});

export const UpdateCategorySchema = CreateCategorySchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const CategoryQuerySchema = z.object({
  isActive: z
    .enum(["true", "false"], { error: "Invalid isActive value" })
    .transform((v) => v === "true")
    .optional(),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export type CategoryQueryInput = z.infer<typeof CategoryQuerySchema>;
