import { useDeleteEntity } from "@/shared/hooks/RTK";

export const useDeleteCategory = () => {
  const { deleteEntity, isLoading, error, isError } = useDeleteEntity<string>(
    useDeleteCategory,
    "delete.category"
  );

  return { deleteCategory: deleteEntity, isLoading, error, isError };
};
