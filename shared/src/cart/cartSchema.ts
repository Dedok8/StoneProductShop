import { z } from "zod";

export const AddToCartItemSchema = z.object({
  productId: z.uuid({ error: "Invalid product id" }),
  quantity: z.number().int().min(1, { error: "Quantity must be at least 1" }),
});

export const UpdateCartIteSchema = AddToCartItemSchema.pick({ quantity: true });

export type AddToCartItemInput = z.infer<typeof AddToCartItemSchema>;
export type UpdateCartIteInput = z.infer<typeof UpdateCartIteSchema>;
