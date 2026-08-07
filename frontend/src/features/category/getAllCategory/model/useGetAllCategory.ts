import { useGetAllCategoryQuery } from "@/entities";

export const useGetAllCategory = () => {
  const { data, isLoading, error, isError, refetch } = useGetAllCategoryQuery();

  return {
    categories: data ?? [],
    isLoading,
    error,
    isError,
    refetch,
  };
};
