import { useDeleteProductColorMutation } from "@/entities";
import { useDeleteEntity } from "@/shared/hooks/RTK";

export const useDeleteProductColor = () => {
  const { deleteEntity, isLoading, isError, error } = useDeleteEntity<string>(
    useDeleteProductColorMutation,
    "delete.productColor"
  );

  return { deleteProductColor: deleteEntity, isLoading, isError, error };
};
