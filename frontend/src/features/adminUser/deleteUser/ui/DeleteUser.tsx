import { useTranslation } from "react-i18next";

import { useDeleteUser } from "@/features/adminUser/deleteUser/model";
import { useQueryState } from "@/shared";

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

  const queryState = useQueryState(isLoading, isError, error);

  return (
    <form onSubmit={handleDeleteUser}>
      <div>
        {queryState}
        <button type="submit" disabled={isLoading}>
          {isLoading ? t("delete.deleting") : t("delete.deleteAccount")}
        </button>
      </div>
    </form>
  );
}

export default DeleteUser;
