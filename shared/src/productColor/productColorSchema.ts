import { z } from "zod";

export const CreateProductColorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Name is required" })
    .max(100, { error: "Name must be at most 100 characters long" }),
  hex: z
    .string()
    .regex(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
      error: "Invalid hex color",
    })
    .nullish(),
});

export const UpdateProductColorSchema =
  CreateProductColorSchema.partial().refine((v) => Object.keys(v).length > 0, {
    error: "At least one field must be provided",
  });

export type CreateProductColorInput = z.infer<typeof CreateProductColorSchema>;
export type UpdateProductColorInput = z.infer<typeof UpdateProductColorSchema>;
