import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useDeleteMe } from "@/features/user/deleteMe/model";
import { FRONT_ROUTES, useQueryState } from "@/shared";

function DeleteMe() {
  const { deleteMe, isLoading, error, isError } = useDeleteMe();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleDelete: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    await deleteMe();
    navigate(FRONT_ROUTES.pages.Authentication.path);
  };
  const queryState = useQueryState(isLoading, isError, error);

  return (
    <form onSubmit={handleDelete}>
      <div>
        {queryState}
        <button type="submit" disabled={isLoading}>
          {isLoading ? t("delete.deleting") : t("delete.deleteAccount")}
        </button>
      </div>
    </form>
  );
}

export default DeleteMe;
