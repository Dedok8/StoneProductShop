import { selectAuthAccessToken } from "@/features/auth/model";
import { useRefresh } from "@/features/auth/refresh/model/useRefresh";
import { mainConfig, useAppSelector } from "@/shared";
import { useEffect, useRef } from "react";

export function useSessionKeepAlive() {
  const accessToken = useAppSelector(selectAuthAccessToken);
  const { refresh } = useRefresh();

  const refreshRef = useRef(refresh);

  useEffect(() => {
    refreshRef.current = refresh;
    if (!accessToken) return;

    const intervalId = window.setInterval(() => {
      refreshRef.current();
    }, mainConfig.SESSION_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [accessToken, refresh]);
}
