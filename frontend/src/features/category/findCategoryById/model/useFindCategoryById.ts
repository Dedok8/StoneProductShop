import { useFindCategoryByIdQuery } from "@/entities";

export const useFindCategoryById = (categoryId?: string) => {
  const { data, isLoading, error, isError, isFetching } =
    useFindCategoryByIdQuery(categoryId ?? "", { skip: !categoryId });

  return {
    category: data,
    isLoading,
    error,
    isError,
    isFetching,
  };
};
