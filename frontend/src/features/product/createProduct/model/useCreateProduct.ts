import { useCreateProductMutation } from "@/entities";
import type { ICreateProductRequest } from "@/shared";

export const useCreateProduct = () => {
  const [createProductMutation, { isLoading, error, isError }] =
    useCreateProductMutation();

  async function createProduct(credentials: ICreateProductRequest) {
    const data = await createProductMutation(credentials).unwrap();
    return data;
  }

  return { createProduct, isLoading, error, isError };
};
