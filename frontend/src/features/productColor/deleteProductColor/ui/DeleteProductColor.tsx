import { useTranslation } from "react-i18next";

import { useDeleteProductColor } from "@/features/productColor/deleteProductColor/model/useDeleteProductColor";
import { useQueryState } from "@/shared";
import { Button } from "@/shared/ui/components/button";

function DeleteProductColor({ colorId }: { colorId: string }) {
  const { deleteProductColor, isLoading, error, isError } =
    useDeleteProductColor();
  const { t } = useTranslation();

  const handleDelete = async () => {
    try {
      await deleteProductColor(colorId);
    } catch (e) {
      console.error(e);
    }
  };
  const queryState = useQueryState(isLoading, isError, error);
  return (
    <div>
      {queryState}

      <Button onClick={handleDelete} disabled={isLoading}>
        {isLoading ? t("delete.deleting") : t("delete.deleteProductColor")}
      </Button>
    </div>
  );
}

export default DeleteProductColor;
