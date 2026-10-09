import { z } from "zod";
import { slugSchema } from "../common/slugSchema";

export const CreateProductOriginSchema = z.object({
  name: z
    .string({ error: "validation.string" })
    .trim()
    .min(1, { error: "validation.productOrigin.name.required" })
    .max(100, { error: "validation.productOrigin.name.max" }),

  slug: slugSchema,
});

export const UpdateProductOriginSchema =
  CreateProductOriginSchema.partial().refine((v) => Object.keys(v).length > 0, {
    error: "validation.atLeastOneField",
  });

export type CreateProductOriginInput = z.infer<
  typeof CreateProductOriginSchema
>;
export type UpdateProductOriginInput = z.infer<
  typeof UpdateProductOriginSchema
>;
