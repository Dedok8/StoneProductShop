import { useFindCategoryByIdQuery } from "@/entities";
import { useGetByIdQueryEntity } from "@/shared/hooks/RTK";
import type { ICategoryResponse } from "@/shared/types";

export const useFindCategoryById = (id?: string) => {
  const { data, isLoading, error, isError, isFetching } = useGetByIdQueryEntity<
    string,
    ICategoryResponse
  >(useFindCategoryByIdQuery, id);

  return {
    category: data,
    isLoading,
    error,
    isError,
    isFetching,
  };
};
