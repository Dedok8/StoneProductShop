import { z } from "zod";
import { slugSchema } from "../common/slugSchema";

export const CreateCategorySchema = z.object({
  name: z
    .string({ error: "validation.string" })
    .trim()
    .min(2, { error: "validation.category.name.min" })
    .max(50, { error: "validation.category.name.max" }),

  slug: slugSchema,
});

export const UpdateCategorySchema = CreateCategorySchema.partial().extend({
  isActive: z.boolean({ error: "validation.boolean" }).optional(),
});

export const CategoryQuerySchema = z.object({
  isActive: z
    .enum(["true", "false"], { error: "validation.category.isActive.invalid" })
    .transform((v) => v === "true")
    .optional(),
  name: z
    .string({ error: "validation.string" })
    .trim()
    .min(1, { error: "validation.nonEmpty" })
    .optional(),
  slug: z
    .string({ error: "validation.string" })
    .trim()
    .min(1, { error: "validation.nonEmpty" })
    .optional(),
});

export const CategoryQuerySearchSchema = z
  .object({
    name: z
      .string({ error: "validation.string" })
      .trim()
      .min(1, { error: "validation.nonEmpty" })
      .optional(),
    slug: z
      .string({ error: "validation.string" })
      .trim()
      .min(1, { error: "validation.nonEmpty" })
      .optional(),
  })
  .refine((q) => !q.name || !q.slug, {
    error: "validation.category.search.eitherSlugOrName",
  });

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export type CategoryQueryInput = z.infer<typeof CategoryQuerySchema>;
export type CategoryQuerySearchInput = z.infer<
  typeof CategoryQuerySearchSchema
>;
