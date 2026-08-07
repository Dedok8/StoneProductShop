import { useUpdateProductMutation } from "@/entities";
import type { IUpdateProductRequest } from "@/shared";

export const useUpdateProduct = () => {
  const [updateProductMutation, { isLoading, error, isError }] =
    useUpdateProductMutation();

  async function updateProduct(productId: string, body: IUpdateProductRequest) {
    const data = await updateProductMutation({ id: productId, body }).unwrap();

    return data;
  }

  return { updateProduct, isLoading, error, isError };
};
