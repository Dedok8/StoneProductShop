import { useTranslation } from "react-i18next";

import { useDeleteProduct } from "@/features/product/deleteProduct/model/useDeleteProduct";
import { getApiErrorMessage } from "@/shared";
import { Button } from "@/shared/ui/components/button";

function DeleteProduct({ prodId }: { prodId: string }) {
  const { deleteProduct, isLoading, error, isError } = useDeleteProduct();
  const { t } = useTranslation();

  const handleDelete = async () => {
    try {
      await deleteProduct(prodId);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      {isError && <div>{getApiErrorMessage(error, t)}</div>}

      <Button onClick={handleDelete} disabled={isLoading}>
        {isLoading ? t("delete.deleting") : t("delete.deleteProduct")}
      </Button>
    </div>
  );
}

export default DeleteProduct;
