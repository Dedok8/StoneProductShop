import { useTranslation } from "react-i18next";

import { useDeleteCategory } from "@/features/category/deleteCategory/model";
import { useQueryState } from "@/shared";
import { Button } from "@/shared/ui/components/button";

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

  const queryState = useQueryState(isLoading, isError, error);
  return (
    <form onSubmit={handleDelete}>
      {queryState}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? t("delete.deleting") : t("delete.deleteCategory")}
      </Button>
    </form>
  );
}

export default DeleteCategory;
