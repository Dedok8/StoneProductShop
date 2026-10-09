import { z } from "zod";

export const CreateProductColorSchema = z.object({
  name: z
    .string({ error: "validation.string" })
    .trim()
    .min(1, { error: "validation.productColor.name.required" })
    .max(100, { error: "validation.productColor.name.max" }),
  hex: z
    .string({ error: "validation.string" })
    .regex(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
      error: "validation.productColor.hex.invalid",
    })
    .nullish(),
});

export const UpdateProductColorSchema =
  CreateProductColorSchema.partial().refine((v) => Object.keys(v).length > 0, {
    error: "validation.atLeastOneField",
  });

export const ProductColorQuerySchema = z.object({
  name: z
    .string({ error: "validation.string" })
    .trim()
    .min(1, { error: "validation.nonEmpty" }),
  hex: z.string({ error: "validation.string" }),
});

export type CreateProductColorInput = z.infer<typeof CreateProductColorSchema>;
export type UpdateProductColorInput = z.infer<typeof UpdateProductColorSchema>;
export type ProductColorQueryInput = z.infer<typeof ProductColorQuerySchema>;
