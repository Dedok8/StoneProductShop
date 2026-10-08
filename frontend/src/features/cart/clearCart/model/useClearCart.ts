import { useClearCartMutation } from "@/entities";
import { useUser } from "@/shared";

export const useClearCart = () => {
  const user = useUser();
  const [clearCartMutation, { isLoading, error, isError }] =
    useClearCartMutation();

  async function clearCart() {
    if (!user || !user.id) return;
    return clearCartMutation(user.id).unwrap();
  }

  return { clearCart, isLoading, error, isError };
};
