import { useEffect, useRef } from "react";

import { selectAccessToken } from "@/features/auth/api";
import { useRefresh } from "@/features/auth/refresh/model/useRefresh";
import { mainConfig, useAppSelector } from "@/shared";

export function useSessionKeepAlive() {
  const accessToken = useAppSelector(selectAccessToken);
  const { refresh } = useRefresh();

  // Keep the latest `refresh` without re-triggering the interval effect.
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    if (!accessToken) return;

    const intervalId = window.setInterval(() => {
      refreshRef.current();
    }, mainConfig.SESSION_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [accessToken]);
}
