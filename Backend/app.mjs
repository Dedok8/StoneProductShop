import express from "express";
import routes from "./src/v1/routes/index.mjs";
import connectDB from "./db/connectDB.mjs";
import { middleware, errorMiddlewareHandler } from "./middleware/index.mjs";

const app = express();

//підключення бази даних
connectDB();
// Використання допоміжних middleware
middleware(app);

//підключення роутів
app.use("/api/v1/", routes);

// Централізований error middleware (404 + error handler)
errorMiddlewareHandler(app);

export default app;
