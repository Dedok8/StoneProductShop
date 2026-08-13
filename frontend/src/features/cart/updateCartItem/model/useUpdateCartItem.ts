import { useUpdateCartItemMutation } from "@/entities";
import type { IUpdateCartItemRequest } from "@/shared";

export const useUpdateCartItem = () => {
  const [updateCartItemMutation, { isLoading, error, isError }] =
    useUpdateCartItemMutation();

  async function updateCartItem(id: string, body: IUpdateCartItemRequest) {
    const data = await updateCartItemMutation({ productId: id, body }).unwrap();
    return data;
  }

  return { updateCartItem, isLoading, error, isError };
};
