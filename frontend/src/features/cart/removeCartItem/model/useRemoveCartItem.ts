import { useRemoveCartItemMutation } from "@/entities";
import { useUser } from "@/shared";

export const useRemoveCartItem = () => {
  const user = useUser();
  const [removeCartItemMutation, { isLoading, error, isError }] =
    useRemoveCartItemMutation();

  async function removeCartItem(productId: string) {
    if (!user?.id) return;
    return removeCartItemMutation({ productId, userId: user.id }).unwrap();
  }

  return { removeCartItem, isLoading, error, isError };
};
