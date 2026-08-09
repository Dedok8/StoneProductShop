import { useGetMyOrdersQuery } from "@/entities";
import type { IGetOrdersQuery } from "@/shared";

export const useGetMyOrders = (params: Omit<IGetOrdersQuery, "userId">) => {
  const { data, isLoading, error, isError, isFetching, refetch } =
    useGetMyOrdersQuery(params);

  return {
    orders: data?.items,
    meta: data?.meta,
    isLoading,
    error,
    isError,
    isFetching,
    refetch,
  };
};
