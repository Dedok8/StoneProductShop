import { useFindProductColorByIdQuery } from "@/entities";

export const useFindProductColorById = (id?: string) => {
  const { data, isLoading, error, isError, isFetching } =
    useFindProductColorByIdQuery(id ?? "", { skip: !id });

  return { productColor: data, isLoading, error, isError, isFetching };
};
