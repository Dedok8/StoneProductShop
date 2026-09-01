import { useCheckoutMutation } from "@/entities";

export const useCheckout = () => {
  const [checkoutMutation, { isLoading, error, isError }] =
    useCheckoutMutation();

  async function checkout() {
    return await checkoutMutation().unwrap();
  }

  return { checkout, isLoading, error, isError };
};
