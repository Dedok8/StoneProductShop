import { useUpdateCategoryMutation } from "@/entities";
import type { IUpdateCategoryRequest } from "@/shared";

export const useUpdateCategory = () => {
  const [updateCategoryMutation, { isLoading, error, isError }] =
    useUpdateCategoryMutation();

  async function updateCategory(
    categoryId: string,
    body: IUpdateCategoryRequest
  ) {
    const data = await updateCategoryMutation({
      id: categoryId,
      body,
    }).unwrap();

    return data;
  }

  return { updateCategory, isLoading, error, isError };
};
