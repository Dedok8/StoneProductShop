import { z } from "zod";
import { BaseQuerySchema } from "../pagination/paginationSchema";
import { SORT_PRODUCT } from "../enums";
import { SearchSchema } from "../common/searchSchema";

export const ProductImageInputSchema = z.object({
  url: z.url({ error: "validation.url" }),
  alt: z
    .string({ error: "validation.string" })
    .max(50, { error: "validation.product.image.alt.max" })
    .optional(),
});

export const CreateProductSchema = z.object({
  name: z
    .string({ error: "validation.string" })
    .trim()
    .min(2, { error: "validation.product.name.min" })
    .max(50, { error: "validation.product.name.max" }),
  slug: z
    .string({ error: "validation.string" })
    .min(2, { error: "validation.product.slug.min" })
    .max(60, { error: "validation.product.slug.max" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      error: "validation.product.slug.format",
    }),
  description: z
    .string({ error: "validation.string" })
    .trim()
    .min(5, { error: "validation.product.description.min" })
    .max(200, { error: "validation.product.description.max" })
    .optional(),
  price: z.coerce
    .number({ error: "validation.number" })
    .min(0.01, { error: "validation.product.price.min" })
    .max(1_000_000, { error: "validation.product.price.max" })
    .multipleOf(0.01, { error: "validation.product.price.decimals" }),
  stock: z.coerce
    .number({ error: "validation.number" })
    .int({ error: "validation.integer" })
    .min(0, { error: "validation.product.stock.min" })
    .max(1_000_000, { error: "validation.product.stock.max" }),
  categoryId: z.uuid({ error: "validation.uuid" }),
  productTypeId: z.uuid({ error: "validation.uuid" }).optional(),
  originId: z.uuid({ error: "validation.uuid" }).optional(),
  colorId: z.uuid({ error: "validation.uuid" }).optional(),
  images: z
    .array(ProductImageInputSchema, {
      error: "validation.product.images.invalid",
    })
    .min(1, { error: "validation.product.images.min" })
    .max(10, { error: "validation.product.images.max" }),
});

export const ProductQuerySchema = BaseQuerySchema.extend({
  sortBy: z
    .enum(SORT_PRODUCT, { error: "validation.sort.invalid" })
    .default(SORT_PRODUCT.CREATED_AT),
  categoryId: z.uuid({ error: "validation.uuid" }).optional(),
  productTypeId: z.uuid({ error: "validation.uuid" }).optional(),
  originId: z.uuid({ error: "validation.uuid" }).optional(),
  colorId: z.uuid({ error: "validation.uuid" }).optional(),
});

export const SearchProductSchema = SearchSchema;

export const UpdateProductSchema = CreateProductSchema.partial().extend({
  isActive: z.boolean({ error: "validation.boolean" }).optional(),
});

export type SearchProductInput = z.infer<typeof SearchProductSchema>;
export type ProductQueryInput = z.infer<typeof ProductQuerySchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type ProductImageInput = z.infer<typeof ProductImageInputSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
