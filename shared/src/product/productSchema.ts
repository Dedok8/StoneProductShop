import { z } from "zod";
import { BaseQuerySchema } from "../pagination/paginationSchema";
import { SORT_PRODUCT } from "../enums";
import { SearchSchema } from "../common/searchSchema";

export const ProductImageInputSchema = z.object({
  url: z.url({ error: "" }),
  alt: z.string().max(50, { error: "" }).optional(),
});

export const CreateProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Name must be at least 2 characters long" })
    .max(50, { error: "Name must be at most 50 characters long" }),
  slug: z
    .string()
    .min(2, { error: "Slug must be at least 2 characters long" })
    .max(60, { error: "Slug must be at most 60 characters long" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      error:
        "Slug must be lowercase, contain only letters, numbers and hyphens",
    }),
  description: z
    .string()
    .trim()
    .min(5, { error: "Description must be at least 5 characters long" })
    .max(200, { error: "Description must be at most 200 characters long" })
    .optional(),
  price: z.coerce
    .number({ error: "Price must be a number" })
    .min(0.01, { error: "Price must be at least 0.01" })
    .max(1_000_000, { error: "Price must be at most 1 000 000" })
    .multipleOf(0.01, { error: "Price must have at most 2 decimal places" }),
  stock: z.coerce
    .number({ error: "Stock must be a number" })
    .int({ error: "Stock must be an integer" })
    .min(0, { error: "Stock cannot be negative" })
    .max(1_000_000, { error: "Stock must be at most 1 000 000" }),
  categoryId: z.uuid({ error: "Invalid category id" }),
  productTypeId: z.uuid({ error: "Invalid product type id" }).optional(),
  originId: z.uuid({ error: "Invalid origin id" }).optional(),
  colorId: z.uuid({ error: "Invalid color id" }).optional(),
  images: z
    .array(ProductImageInputSchema, { error: "Images must be an array" })
    .min(1, { error: "At least one image is required" })
    .max(10, { error: "At most 10 images are allowed" }),
});

export const ProductQuerySchema = BaseQuerySchema.extend({
  sortBy: z
    .enum(SORT_PRODUCT, { error: "Invalid sort field" })
    .default(SORT_PRODUCT.CREATED_AT),
  categoryId: z.uuid({ error: "Invalid category id" }).optional(),
  productTypeId: z.uuid({ error: "Invalid product type id" }).optional(),
  originId: z.uuid({ error: "Invalid origin id" }).optional(),
  colorId: z.uuid({ error: "Invalid color id" }).optional(),
});

export const SearchProductSchema = SearchSchema;

export const UpdateProductSchema = CreateProductSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type SearchProductInput = z.infer<typeof SearchProductSchema>;
export type ProductQueryInput = z.infer<typeof ProductQuerySchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type ProductImageInput = z.infer<typeof ProductImageInputSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
