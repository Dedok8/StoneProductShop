import { useUpdateInspirationMutation } from "@/entities";
import type { IUpdateInspiration } from "@/shared/types";

export const useUpdateInspiration = () => {
  const [updateInspirationMutation, { isLoading, error, isError }] =
    useUpdateInspirationMutation();

  async function updateInspiration(id: string, body: IUpdateInspiration) {
    const data = await updateInspirationMutation({ id, body }).unwrap();

    return data;
  }

  return { updateInspiration, isLoading, error, isError };
};
