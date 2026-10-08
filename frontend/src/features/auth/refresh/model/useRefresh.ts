import { useCallback } from "react";

import { useRefreshMutation } from "@/features/auth/api";
import { logout, setCredentials, useAppDispatch } from "@/shared";

export const useRefresh = () => {
  const [refreshMutation, { isLoading, error }] = useRefreshMutation();
  const dispath = useAppDispatch();

  const refresh = useCallback(async () => {
    try {
      const data = await refreshMutation().unwrap();

      dispath(setCredentials(data));

      return true;
    } catch {
      dispath(logout());
      return false;
    }
  }, [refreshMutation, dispath]);

  return { refresh, isLoading, error };
};
