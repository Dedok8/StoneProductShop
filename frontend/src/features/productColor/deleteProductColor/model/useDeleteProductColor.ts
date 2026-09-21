import { useTranslation } from "react-i18next";

import { useDeleteProductColorMutation } from "@/entities";

export const useDeleteProductColor = () => {
  const { t } = useTranslation();

  const [deleteColorProductMutation, { isLoading, isError, error }] =
    useDeleteProductColorMutation();

  async function deleteProductColor(colorId: string) {
    const confirmed = window.confirm(t("delete.deleteProductColor"));

    if (!confirmed) return;

    await deleteColorProductMutation(colorId).unwrap();
  }

  return { deleteProductColor, isLoading, isError, error };
};
