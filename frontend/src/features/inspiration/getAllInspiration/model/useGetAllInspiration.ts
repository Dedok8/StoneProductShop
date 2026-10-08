import { useGetAllInspirationQuery } from "@/entities";

export const useGetAllInspiration = () => {
  const { data, isLoading, error, isError, refetch } =
    useGetAllInspirationQuery();

  return {
    inspirations: data ?? [],
    isLoading,
    error,
    isError,

    refetch,
  };
};
