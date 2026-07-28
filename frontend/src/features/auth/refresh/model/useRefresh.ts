import { useRefreshMutation } from "@/features/auth/api";
import { logout, setCredentials } from "@/features/auth/model";
import { useAppDispatch } from "@/shared";
import { useCallback } from "react";

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
