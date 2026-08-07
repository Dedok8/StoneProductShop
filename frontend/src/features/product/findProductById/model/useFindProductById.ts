import { useFindProductByIdQuery } from "@/entities";

export const useFindProductById = (productId?: string) => {
  const { data, isLoading, error, isError, isFetching } =
    useFindProductByIdQuery(productId ?? "", { skip: !productId });

  return {
    product: data,
    isLoading,
    error,
    isError,
    isFetching,
  };
};
