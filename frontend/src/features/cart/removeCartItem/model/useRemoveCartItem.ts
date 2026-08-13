import { useRemoveCartItemMutation } from "@/entities";

export const useRemoveCartItem = () => {
  const [removeCartItemMutation, { isLoading, error, isError }] =
    useRemoveCartItemMutation();

  async function removeCartItem(productId: string) {
    return removeCartItemMutation(productId).unwrap();
  }

  return { removeCartItem, isLoading, error, isError };
};
