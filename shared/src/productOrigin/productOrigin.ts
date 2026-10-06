import { z } from "zod";
import { slugSchema } from "../common/slugSchema";

export const CreateProductOriginSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Name is required" })
    .max(100, { error: "Name must be at most 100 characters long" }),

  slug: slugSchema,
});

export const UpdateProductOriginSchema =
  CreateProductOriginSchema.partial().refine((v) => Object.keys(v).length > 0, {
    error: "At least one field must be provided",
  });

export type CreateProductOriginInput = z.infer<
  typeof CreateProductOriginSchema
>;
export type UpdateProductOriginInput = z.infer<
  typeof UpdateProductOriginSchema
>;
