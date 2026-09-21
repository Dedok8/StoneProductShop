import { useCreateProductColorMutation } from "@/entities/productColor/api/productColorApi";
import type { ICreateProductColorRequest } from "@/shared/types";

export const useCreateProductColor = () => {
  const [createProductColorMutation, { isLoading, isError, error }] =
    useCreateProductColorMutation();

  async function createProductColor(credentials: ICreateProductColorRequest) {
    const data = await createProductColorMutation(credentials).unwrap();

    return data;
  }

  return { createProductColor, isLoading, isError, error };
};
