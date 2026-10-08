import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useLogoutMutation } from "@/features/auth/api";
import { logout as logoutAction, useAppDispatch } from "@/shared";
import { getApiErrorMessage } from "@/shared/ui/Error";

export const useLogout = () => {
  const [logoutMutation, { isLoading, isError }] = useLogoutMutation();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function logout() {
    try {
      await logoutMutation(undefined).unwrap();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, t));
    } finally {
      dispatch(logoutAction());
    }
  }

  return { logout, isLoading, isError, errorMessage };
};
