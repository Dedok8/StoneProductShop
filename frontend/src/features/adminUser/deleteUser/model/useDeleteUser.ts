import { useDeleteUserMutation } from "@/entities";
import { useDeleteEntity } from "@/shared/hooks/RTK";

export const useDeleteUser = () => {
  const { deleteEntity, isLoading, error, isError } = useDeleteEntity<string>(
    useDeleteUserMutation,
    "delete.deleteUser"
  );

  return { deleteUser: deleteEntity, isLoading, error, isError };
};
