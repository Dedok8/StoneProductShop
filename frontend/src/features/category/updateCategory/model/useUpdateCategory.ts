import { useUpdateCategoryMutation } from "@/entities";
import { useUpdateEntity } from "@/shared/hooks/RTK";
import type { ICategoryResponse, IUpdateCategoryRequest } from "@/shared/types";

export const useUpdateCategory = () => {
  const { updateEntity, isLoading, error, isError } = useUpdateEntity<
    { id: string; body: IUpdateCategoryRequest },
    ICategoryResponse
  >(useUpdateCategoryMutation);

  return { updateCategory: updateEntity, isLoading, error, isError };
};
