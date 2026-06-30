export const mainConfig = {
  BASE_URL: import.meta.env.VITE_API_URL as string,

  SESSION_REFRESH_INTERVAL_MS: 10 * 60 * 1000,
};
