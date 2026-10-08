import { useTranslation } from "react-i18next";

import { useDeleteMeMutation } from "@/entities";
import { setUser, useAppDispatch } from "@/shared";

export const useDeleteMe = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [deleteMeMutation, { isLoading, error, isError }] =
    useDeleteMeMutation();

  async function deleteMe() {
    const confirmed = window.confirm(t("delete.deleteAccount"));
    if (!confirmed) return;

    try {
      await deleteMeMutation().unwrap();
      dispatch(setUser(null));
    } catch (error) {
      console.error(error);
    }
  }
  return { deleteMe, isLoading, error, isError };
};
