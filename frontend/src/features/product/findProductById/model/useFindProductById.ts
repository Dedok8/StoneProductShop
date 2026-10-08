import { useFindProductByIdQuery } from "@/entities";

export const useFindProductById = (id?: string) => {
  const { data, isLoading, error, isError, isFetching } =
    useFindProductByIdQuery(id ?? "", { skip: !id });

  return {
    product: data,
    isLoading,
    error,
    isError,
    isFetching,
  };
};
