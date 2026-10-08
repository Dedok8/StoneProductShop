import { useGetCartQuery } from "@/entities";
import { useUser } from "@/shared";

export const useGetCart = () => {
  const user = useUser();

  const { data, isLoading, error, isError, refetch } = useGetCartQuery(
    user?.id ?? "",
    {
      skip: !user?.id,
    }
  );

  return { cart: data, isLoading, error, isError, refetch };
};
