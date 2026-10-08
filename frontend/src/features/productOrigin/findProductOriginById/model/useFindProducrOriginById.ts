import { useFindCategoryByIdQuery } from "@/entities";
import { useGetByIdQueryEntity } from "@/shared/hooks/RTK";
import type { IProductOriginResponse } from "@/shared/types";

export const useFindProductOriginById = (id?: string) => {
  const { data, isLoading, error, isError, isFetching } = useGetByIdQueryEntity<
    string,
    IProductOriginResponse
  >(useFindCategoryByIdQuery, id);

  return { productOrigin: data, isLoading, error, isError, isFetching };
};
