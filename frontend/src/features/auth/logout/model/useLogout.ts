import { useState } from "react";
import { logout as logoutAction } from "@/features/auth/model/authSlice";
import { useLogoutMutation } from "@/features/auth/api";
import { useAppDispatch } from "@/shared";
import { useTranslation } from "react-i18next";
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
