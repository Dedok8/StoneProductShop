import { useDeleteInspirationMutation } from "@/entities";

export const useDeleteInspiration = () => {
  const [deleteInspirationMutation, { isLoading, error, isError }] =
    useDeleteInspirationMutation();

  async function deleteInspiration(id: string) {
    await deleteInspirationMutation(id).unwrap();
  }

  return { deleteInspiration, isLoading, error, isError };
};
