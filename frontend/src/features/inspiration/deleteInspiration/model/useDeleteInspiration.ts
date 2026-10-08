import { useDeleteInspirationMutation } from "@/entities";
import { useDeleteEntity } from "@/shared/hooks/RTK";

export const useDeleteInspiration = () => {
  const { deleteEntity, isLoading, error, isError } = useDeleteEntity<string>(
    useDeleteInspirationMutation,
    "delete.inspiration"
  );

  return { deleteEntity, isLoading, error, isError };
};
