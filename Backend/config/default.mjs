import dotenv from "dotenv";
dotenv.config();

export default Object.freeze({
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  databaseName: process.env.DATABASE_NAME,
  databaseUrl: process.env.MONGODB_URL,
  mongoURI: `${process.env.MONGODB_URL}${process.env.DATABASE_NAME}`,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "default_access_jwt_secret",
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET || "default_refresh_jwt_secret",
  accessExpires: process.env.ACCESS_EXPIRES || "900s",
  refreshExpires: process.env.REFRESH_EXPIRES || "7d",
  refreshCookiesExpires:
    process.env.REFRESH_COOKIES_EXPIRES !== undefined
      ? Number(process.env.REFRESH_COOKIES_EXPIRES)
      : 604800000,
  sessionSecret: process.env.SESSION_SECRET || "default_session_secret",
  checkAuth: process.env.CHECK_AUTH,
});
