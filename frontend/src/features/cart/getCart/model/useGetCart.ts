import { useGetCartQuery } from "@/entities";

export const useGetCart = () => {
  const { data, isLoading, error, isError, refetch } = useGetCartQuery();

  return { cart: data, isLoading, error, isError, refetch };
};
