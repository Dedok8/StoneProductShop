import { z } from "zod";

export const CreateInspirationImageSchema = z.object({
  imageUrl: z.url({
    protocol: /^https?$/,
    error: "validation.inspiration.imageUrl.invalid",
  }),
  alt: z.string({ error: "validation.string" }).optional(),
});

export const UpdateInspirationImageSchema =
  CreateInspirationImageSchema.partial();

export const InspirationQuerySchema = z.object({});

export type CreateInspirationImageInput = z.infer<
  typeof CreateInspirationImageSchema
>;
export type UpdateInspirationImageInput = z.infer<
  typeof UpdateInspirationImageSchema
>;
