import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { useDeleteCategory } from "@/features/category/deleteCategory/model";
import { Button } from "@/shared/ui/components/button";
import { getApiErrorMessage } from "@/shared/ui/Error";

function DeleteCategory() {
  const { deleteCategory, isLoading, error, isError } = useDeleteCategory();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const handleDelete: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      if (!id) return;

      const categoryId: string = id;
      await deleteCategory(categoryId);
    } catch (e) {
      //
    }
  };
  return (
    <form onSubmit={handleDelete}>
      <div>{isError && <div>{getApiErrorMessage(error, t)}</div>}</div>

      <Button type="submit" disabled>
        {isLoading ? t("delete.deleting") : t("delete.deleteCategory")}
      </Button>
    </form>
  );
}

export default DeleteCategory;
