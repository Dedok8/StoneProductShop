import { z } from "zod";

export const AddToCartItemSchema = z.object({
  productId: z.uuid({ error: "validation.uuid" }),
  quantity: z
    .number({ error: "validation.number" })
    .int({ error: "validation.integer" })
    .min(1, { error: "validation.cart.quantity.min" }),
});

export const UpdateCartItemSchema = AddToCartItemSchema.pick({
  quantity: true,
});

export type AddToCartItemInput = z.infer<typeof AddToCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>;
