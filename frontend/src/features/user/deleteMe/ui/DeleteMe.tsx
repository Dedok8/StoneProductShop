import { useTranslation } from "react-i18next";

import { useDeleteMe } from "@/features/user/deleteMe/model";
import { getApiErrorMessage } from "@/shared/ui/Error";

function DeleteMe() {
  const { deleteMe, isLoading, error, isError } = useDeleteMe();
  const { t } = useTranslation();

  const handleDelete: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    await deleteMe();
  };

  return (
    <form onSubmit={handleDelete}>
      <div>
        {isError && <div>{getApiErrorMessage(error, t)}</div>}
        <button type="submit" disabled={isLoading}>
          {isLoading
            ? t("delete.deleting", )
            : t("delete.deleteAccount")}
        </button>
      </div>
    </form>
  );
}

export default DeleteMe;
