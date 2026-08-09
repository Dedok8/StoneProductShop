import { useGetOrderByIdQuery } from "@/entities";

export const useFindOrderById = (orderId?: string) => {
  const { data, isLoading, error, isError, isFetching } = useGetOrderByIdQuery(
    orderId ?? "",
    { skip: !orderId }
  );

  return {
    order: data,
    isLoading,
    error,
    isError,
    isFetching,
  };
};
