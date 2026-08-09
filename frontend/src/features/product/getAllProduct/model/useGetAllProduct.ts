import { useGetAllProductQuery } from "@/entities";
import type { IGetProductsQuery } from "@/shared";

export const useGetAllProduct = (query: IGetProductsQuery) => {
  const { data, isLoading, error, isError, isFetching, refetch } =
    useGetAllProductQuery(query);

  return {
    products: data?.items ?? [],
    meta: data?.meta,
    isLoading,
    error,
    isError,
    isFetching,
    refetch,
  };
};
