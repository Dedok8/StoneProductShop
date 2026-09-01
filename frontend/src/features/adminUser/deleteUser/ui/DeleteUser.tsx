import { useTranslation } from "react-i18next";

import { useDeleteUser } from "@/features/adminUser/deleteUser/model";
import { getApiErrorMessage } from "@/shared/ui/Error";

function DeleteUser({ userId }: { userId: string }) {
  const { deleteUser, isLoading, error, isError } = useDeleteUser();

  const { t } = useTranslation();

  const handleDeleteUser: React.SubmitEventHandler<HTMLFormElement> = async (
    e
  ) => {
    e.preventDefault();

    try {
      await deleteUser(userId);
    } catch (e) {
      //
    }
  };

  return (
    <form onSubmit={handleDeleteUser}>
      <div>
        {isError && <div>{getApiErrorMessage(error, t)}</div>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? t("delete.deleting") : t("delete.deleteAccount")}
        </button>
      </div>
    </form>
  );
}

export default DeleteUser;
