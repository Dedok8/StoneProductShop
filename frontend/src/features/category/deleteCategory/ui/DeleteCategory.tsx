import { useTranslation } from "react-i18next";

import { useDeleteCategory } from "@/features/category/deleteCategory/model";
import { Button } from "@/shared/ui/components/button";
import { getApiErrorMessage } from "@/shared/ui/Error";

function DeleteCategory({ categoryId }: { categoryId: string }) {
  const { deleteCategory, isLoading, error, isError } = useDeleteCategory();

  const { t } = useTranslation();

  const handleDelete: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      await deleteCategory(categoryId);
    } catch (e) {
      //
    }
  };
  return (
    <form onSubmit={handleDelete}>
      <div>{isError && <div>{getApiErrorMessage(error, t)}</div>}</div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? t("delete.deleting") : t("delete.deleteCategory")}
      </Button>
    </form>
  );
}

export default DeleteCategory;
