import { useAddCartItemMutation } from "@/entities";
import type { IAddCartItemRequest } from "@/shared";

export const useAddToCartItem = () => {
  const [addToCartMutationItem, { isLoading, error, isError }] =
    useAddCartItemMutation();

  async function addToCartItem(body: IAddCartItemRequest) {
    const data = await addToCartMutationItem(body).unwrap();
    return data;
  }

  return { addToCartItem, isLoading, error, isError };
};
