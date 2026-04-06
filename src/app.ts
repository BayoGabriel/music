import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { adminRouter } from "./modules/admin/admin.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { songsRouter } from "./modules/songs/songs.routes";
import { usersRouter } from "./modules/users/users.routes";
import { withdrawalRouter } from "./modules/withdrawal/withdrawal.routes";
import { errorHandlerMiddleware } from "./common/middleware/error-handler.middleware";
import { notFoundMiddleware } from "./common/middleware/not-found.middleware";

export const createApp = () => {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors());
  app.use(morgan("combined"));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/auth", authRouter);
  app.use("/users", usersRouter);
  app.use("/songs", songsRouter);
  app.use("/withdrawal", withdrawalRouter);
  app.use("/admin", adminRouter);

  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);

  return app;
};
