import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { useDeleteProduct } from "@/features/product/deleteProduct/model/useDeleteProduct";
import { getApiErrorMessage } from "@/shared";
import { Button } from "@/shared/ui/components/button";

function DeleteProduct() {
  const { deleteProduct, isLoading, error, isError } = useDeleteProduct();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const handleDelete: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      if (!id) return;

      await deleteProduct(id);
    } catch (e) {
      //
    }
  };
  return (
    <form onSubmit={handleDelete}>
      <div>{isError && <div>{getApiErrorMessage(error, t)}</div>}</div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? t("delete.deleting") : t("delete.deleteProduct")}
      </Button>
    </form>
  );
}

export default DeleteProduct;
