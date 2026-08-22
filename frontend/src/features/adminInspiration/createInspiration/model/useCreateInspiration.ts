import { useCreateInspirationMutation } from "@/entities";
import type { ICreateInspiration } from "@/shared/types";

export const useCreateInspiration = () => {
  const [createInspirationMutation, { isLoading, error, isError }] =
    useCreateInspirationMutation();

  async function createInspiration(credential: ICreateInspiration) {
    const data = await createInspirationMutation(credential).unwrap();

    return data;
  }

  return { createInspiration, isLoading, error, isError };
};
