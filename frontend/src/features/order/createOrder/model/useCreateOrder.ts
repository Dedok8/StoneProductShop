import { useCreateOrderMutation } from "@/entities";
import type { ICreateOrderRequest } from "@/shared";

export const useCreateOrder = () => {
  const [createOrderMutation, { isLoading, error, isError }] =
    useCreateOrderMutation();

  async function createOrder(body: ICreateOrderRequest) {
    const data = await createOrderMutation(body).unwrap();
    return data;
  }

  return { createOrder, isLoading, error, isError };
};
