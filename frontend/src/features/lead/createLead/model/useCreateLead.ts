import { useCreateLeadMutation } from "@/entities";
import type { ICreateLead } from "@/shared";

export const useCreateLead = () => {
  const [createLeadMutation, { isLoading, error, isError }] =
    useCreateLeadMutation();

  async function createLead(credential: ICreateLead) {
    const data = await createLeadMutation(credential).unwrap();
    return data;
  }

  return { createLead, isLoading, error, isError };
};
