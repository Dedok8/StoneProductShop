import { useCallback } from "react";

import {
  logout,
  setCredentials,
  useRefreshMutation,
} from "@/features/auth/api";
import { useAppDispatch } from "@/shared";

export const useRefresh = () => {
  const [refreshMutation, { isLoading, error }] = useRefreshMutation();
  const dispatch = useAppDispatch();

  const refresh = useCallback(async () => {
    try {
      const data = await refreshMutation().unwrap();
      dispatch(setCredentials(data));
      return true;
    } catch {
      dispatch(logout());
      return false;
    }
  }, [refreshMutation, dispatch]);

  return { refresh, isLoading, error };
};
