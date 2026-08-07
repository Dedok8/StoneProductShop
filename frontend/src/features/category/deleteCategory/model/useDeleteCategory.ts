import { useTranslation } from "react-i18next";

import { useDeleteCategoryMutation } from "@/entities";

export const useDeleteCategory = () => {
  const { t } = useTranslation();
  const [deleteCategoryMutation, { isLoading, error, isError }] =
    useDeleteCategoryMutation();

  async function deleteCategory(categoryId: string) {
    const confirmed = window.confirm(t("delete.deleteCategory"));
    if (!confirmed) await deleteCategoryMutation(categoryId).unwrap();
  }

  return { deleteCategory, isLoading, error, isError };
};
