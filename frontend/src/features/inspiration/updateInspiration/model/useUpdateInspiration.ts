import { useUpdateInspirationMutation } from "@/entities";
import { useUpdateEntity } from "@/shared/hooks/RTK";
import type { IInspirationResponse, IUpdateInspiration } from "@/shared/types";

export const useUpdateInspiration = () => {
  const { updateEntity, isLoading, isError, error } = useUpdateEntity<
    { id: string; body: IUpdateInspiration },
    IInspirationResponse
  >(useUpdateInspirationMutation);

  return { updateInspiration: updateEntity, isLoading, error, isError };
};
