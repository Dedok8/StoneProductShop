import { useUpdateCartItemMutation } from "@/entities";
import { useUser } from "@/shared";
import type { IUpdateCartItemRequest } from "@/shared/types";

export const useUpdateCartItem = () => {
  const user = useUser();

  const [updateCartItemMutation, { isLoading, error, isError }] =
    useUpdateCartItemMutation();

  async function updateCartItem(id: string, body: IUpdateCartItemRequest) {
    if (!user?.id) return;

    const data = await updateCartItemMutation({
      userId: user.id,
      productId: id,
      body,
    }).unwrap();

    return data;
  }

  return {
    updateCartItem,
    isLoading,
    error,
    isError,
  };
};
