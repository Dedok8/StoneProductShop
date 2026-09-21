import { useGetAllProductColorQuery } from "@/entities";

export const useGetAllProductColor = () => {
  const { data, isLoading, error, isError, refetch } =
    useGetAllProductColorQuery();

  return {
    productColor: data ?? [],
    isLoading,
    error,
    isError,
    refetch,
  };
};
