import { useCreateCategoryMutation } from "@/entities";
import { useCreateEntity } from "@/shared/hooks/RTK";
import type { ICategoryResponse, ICreateCategoryRequest } from "@/shared/types";

export const useCreateCategory = () => {
  const { createEntity, isLoading, error, isError } = useCreateEntity<
    ICreateCategoryRequest,
    ICategoryResponse
  >(useCreateCategoryMutation);

  return { createCategory: createEntity, isLoading, isError, error };
};
