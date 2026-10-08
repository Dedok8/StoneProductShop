import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { useDeleteInspiration } from "@/features/inspiration/deleteInspiration/model";
import { useQueryState } from "@/shared";

function DeleteInspiration() {
  const { deleteInspiration, isLoading, error, isError } =
    useDeleteInspiration();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const handleDelete: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    try {
      if (!id) return;

      await deleteInspiration(id);
    } catch (e) {
      //
    }
  };

  const queryState = useQueryState(isLoading, isError, error);
  return (
    <form onSubmit={handleDelete}>
      {queryState}
      <button type="button" disabled={isLoading}>
        {isLoading ? t("delete.deleting") : t("delete.deleteInspiration")}
      </button>
      ;
    </form>
  );
}

export default DeleteInspiration;
