import { useUpdateOrderStatusMutation } from "@/entities";
import type { IUpdateOrderStatusRequest } from "@/shared";

export const useUpdateOrderStatus = () => {
  const [updateOrderStatusMutation, { isLoading, error, isError }] =
    useUpdateOrderStatusMutation();

  async function updateOrderStatus(
    id: string,
    body: IUpdateOrderStatusRequest
  ) {
    const data = await updateOrderStatusMutation({ id, body });
    return data;
  }

  return { updateOrderStatus, isLoading, error, isError };
};
