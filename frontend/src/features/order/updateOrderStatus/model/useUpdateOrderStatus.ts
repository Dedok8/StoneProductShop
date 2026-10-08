import { useUpdateOrderStatusMutation } from "@/entities";
import { useUpdateEntity } from "@/shared/hooks/RTK";
import type { IOrderResponse, IUpdateOrderStatusRequest } from "@/shared/types";

export const useUpdateOrderStatus = () => {
  const { updateEntity, isLoading, isError, error } = useUpdateEntity<
    { id: string; body: IUpdateOrderStatusRequest },
    IOrderResponse
  >(useUpdateOrderStatusMutation);

  return { updateOrderStatus: updateEntity, isLoading, error, isError };
};
