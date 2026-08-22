import { useCreateCategoryMutation } from "@/entities";
import type { ICreateCategoryRequest } from "@/shared/types";

export const useCreateCategory = () => {
  const [createCategoryMutation, { isLoading, error, isError }] =
    useCreateCategoryMutation();

  async function createCategory(credentials: ICreateCategoryRequest) {
    const data = await createCategoryMutation(credentials).unwrap();
    return data;
  }

  return { createCategory, isLoading, error, isError };
};
