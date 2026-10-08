import { useDeleteProductColorMutation } from "@/entities";
import { useDeleteEntity } from "@/shared/hooks/RTK";

export const useDeleteProductOrigin = () => {
  const { deleteEntity, isLoading, isError, error } = useDeleteEntity<string>(
    useDeleteProductColorMutation,
    "delete.productColor"
  );

  return { deleteProductOrigin: deleteEntity, isLoading, isError, error };
};
