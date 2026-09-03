import { useAddCartItemMutation } from "@/entities";
import { useUser } from "@/shared";
import type { IAddCartItemRequest } from "@/shared/types";

export const useAddToCartItem = () => {
  const user = useUser();
  const [addToCartMutationItem, { isLoading, error, isError }] =
    useAddCartItemMutation();

  async function addToCartItem(body: IAddCartItemRequest) {
    if (!user?.id) return;
    const data = await addToCartMutationItem({
      ...body,
      userId: user.id,
    }).unwrap();
    return data;
  }

  return { addToCartItem, isLoading, error, isError };
};
