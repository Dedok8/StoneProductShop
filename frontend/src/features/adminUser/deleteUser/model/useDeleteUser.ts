import { useTranslation } from "react-i18next";

import { useDeleteUserMutation } from "@/entities";

export const useDeleteUser = () => {
  const { t } = useTranslation();
  const [deleteUserMutation, { isLoading, error, isError }] =
    useDeleteUserMutation();

  async function deleteUser(userId: string) {
    const confirmed = window.confirm(t("delete.deleteAccount"));
    if (!confirmed) return;
    try {
      await deleteUserMutation(userId).unwrap();
    } catch (error) {
      console.error(error);
    }
  }

  return { deleteUser, isLoading, error, isError };
};
