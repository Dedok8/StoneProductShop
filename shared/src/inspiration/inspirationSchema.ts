import { z } from "zod";

export const CreateInspirationImageSchema = z.object({
  imageUrl: z.url({
    protocol: /^https?$/,
    error: "Invalid image URL",
  }),
  alt: z.string().optional(),
});

export const UpdateInspirationImageSchema =
  CreateInspirationImageSchema.partial();

export type CreateInspirationImageInput = z.infer<
  typeof CreateInspirationImageSchema
>;
export type UpdateInspirationImageInput = z.infer<
  typeof UpdateInspirationImageSchema
>;
