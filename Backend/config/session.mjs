import session from "express-session";
import MongoStore from "connect-mongo";
import config from "./default.mjs";

const sessionConfig = session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.mongoURI,
  }),
  cookie: {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    maxAge: config.refreshCookiesExpires,
  },
});

export default sessionConfig;
