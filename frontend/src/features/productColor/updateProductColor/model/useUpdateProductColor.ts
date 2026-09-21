import { useUpdateProductColorMutation } from "@/entities";
import type { IUpdateProductColorRequest } from "@/shared/types";

export const useUpdateProductColor = () => {
  const [updateProductColorMutation, { isLoading, error, isError }] =
    useUpdateProductColorMutation();

  async function updateProductColor(
    id: string,
    body: IUpdateProductColorRequest
  ) {
    const data = await updateProductColorMutation({ id, body }).unwrap();

    return data;
  }

  return { updateProductColor, isLoading, error, isError };
};
