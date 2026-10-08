export const mainConfig = {
  BASE_URL: import.meta.env.VITE_BASE_URL as string,

  SESSION_REFRESH_INTERVAL_MS: Number(
    import.meta.env.VITE_SESSION_REFRESH_INTERVAL_MS
  ),
};
