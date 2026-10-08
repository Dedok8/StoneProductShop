import { useTranslation } from "react-i18next";

import { useDeleteProductMutation } from "@/entities";

export const useDeleteProduct = () => {
  const { t } = useTranslation();
  const [deleteProductMutation, { isLoading, error, isError }] =
    useDeleteProductMutation();

  async function deleteProduct(productId: string) {
    const confirmed = window.confirm(t("delete.deleteProduct"));
    if (!confirmed) return;

    await deleteProductMutation(productId).unwrap();
  }

  return { deleteProduct, isLoading, error, isError };
};
