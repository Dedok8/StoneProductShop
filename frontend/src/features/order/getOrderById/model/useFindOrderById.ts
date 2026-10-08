import { useGetOrderByIdQuery } from "@/entities";
import { useGetByIdQueryEntity } from "@/shared/hooks/RTK";
import type { IOrderResponse } from "@/shared/types";

export const useFindOrderById = (orderId?: string) => {
  const { data, isLoading, isError, error, isFetching } = useGetByIdQueryEntity<
    string,
    IOrderResponse
  >(useGetOrderByIdQuery, orderId);

  return {
    order: data,
    isLoading,
    error,
    isError,
    isFetching,
  };
};
