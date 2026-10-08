import { useGetAllOrdersQuery } from "@/entities";
import { useGetAllPaginated } from "@/shared/hooks/RTK";
import type { IGetOrdersQuery, IOrderResponse } from "@/shared/types";

export const useGetAllOrders = (query: IGetOrdersQuery) => {
  const { items, meta, isLoading, error, isError, isFetching, refetch } =
    useGetAllPaginated<IGetOrdersQuery, IOrderResponse>(
      useGetAllOrdersQuery,
      query
    );
  return {
    orders: items,
    meta,
    isLoading,
    error,
    isError,
    isFetching,
    refetch,
  };
};
