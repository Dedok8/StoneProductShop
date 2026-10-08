import { useCreateLeadMutation } from "@/entities";
import { useCreateEntity } from "@/shared/hooks/RTK";
import type { ICreateLead, ILeadsResponse } from "@/shared/types";

export const useCreateLead = () => {
  const { createEntity, isLoading, isError, error } = useCreateEntity<
    ICreateLead,
    ILeadsResponse
  >(useCreateLeadMutation);

  return { createLead: createEntity, isLoading, error, isError };
};
