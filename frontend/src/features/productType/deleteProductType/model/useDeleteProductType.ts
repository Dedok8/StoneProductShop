import { useDeleteProductTypeMutation } from "@/entities/productType/api";
import { useDeleteEntity } from "@/shared/hooks/RTK";

export const useDeleteProductType = () => {
  const { deleteEntity, isLoading, isError, error } = useDeleteEntity<string>(
    useDeleteProductTypeMutation,
    "delete.productType"
  );

  return { deleteProductType: deleteEntity, isLoading, isError, error };
};
