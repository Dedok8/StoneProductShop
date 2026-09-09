import { useTranslation } from "react-i18next";

import { useDeleteProduct } from "@/features/product/deleteProduct/model/useDeleteProduct";
import { useQueryState } from "@/shared";
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
  const queryState = useQueryState(isLoading, isError, error);
  return (
    <div>
      {queryState}

      <Button onClick={handleDelete} disabled={isLoading}>
        {isLoading ? t("delete.deleting") : t("delete.deleteProduct")}
      </Button>
    </div>
  );
}

export default DeleteProduct;
