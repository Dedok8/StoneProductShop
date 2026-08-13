import { useClearCartMutation } from "@/entities";

export const useClearCart = () => {
  const [clearCartMutation, { isLoading, error, isError }] =
    useClearCartMutation();

  async function clearCart() {
    return clearCartMutation().unwrap();
  }

  return { clearCart, isLoading, error, isError };
};
