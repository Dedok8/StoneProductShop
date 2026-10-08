import { useCreateOrderMutation } from "@/entities";
import { useCreateEntity } from "@/shared/hooks/RTK";
import type { ICreateOrderRequest, IOrderResponse } from "@/shared/types";

export const useCreateOrder = () => {
  const { createEntity, isLoading, isError, error } = useCreateEntity<
    ICreateOrderRequest,
    IOrderResponse
  >(useCreateOrderMutation);

  return { createOrder: createEntity, isLoading, error, isError };
};
