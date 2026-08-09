import { useGetAllOrdersQuery } from "@/entities";
import type { IGetOrdersQuery } from "@/shared";

export const useGetAllOrders = (query: IGetOrdersQuery) => {
  const { data, isLoading, error, isError, isFetching, refetch } =
    useGetAllOrdersQuery(query);

  return {
    orders: data?.items ?? [],
    meta: data?.meta,
    isLoading,
    error,
    isError,
    isFetching,
    refetch,
  };
};
