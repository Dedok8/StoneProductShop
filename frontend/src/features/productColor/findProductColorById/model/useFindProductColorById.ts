import { useFindProductColorByIdQuery } from "@/entities";
import { useGetByIdQueryEntity } from "@/shared/hooks/RTK";
import type { IProductColorResponse } from "@/shared/types";

export const useFindProductColorById = (id?: string) => {
  const { data, isLoading, isError, error, isFetching } = useGetByIdQueryEntity<
    string,
    IProductColorResponse
  >(useFindProductColorByIdQuery, id);

  return { productColor: data, isLoading, error, isError, isFetching };
};
