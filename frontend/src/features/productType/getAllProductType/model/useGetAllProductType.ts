import { useGetAllProductTypeQuery } from "@/entities/productType/api";

export const useGetAllProductType = () => {
  const { data, isLoading, error, isError, refetch } =
    useGetAllProductTypeQuery();

  return {
    productType: data ?? [],
    isLoading,
    error,
    isError,
    refetch,
  };
};
