import { useGetAllProductOriginQuery } from "@/entities/productOrigin/api/productOriginApi";

export const useGetAllProductOrigin = () => {
  const { data, isLoading, error, isError, refetch } =
    useGetAllProductOriginQuery();

  return {
    productOrigin: data ?? [],
    isLoading,
    error,
    isError,
    refetch,
  };
};
