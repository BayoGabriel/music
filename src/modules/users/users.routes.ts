import { Router } from "express";
import { authGuard } from "../../common/guards/auth.guard";
import { asyncHandler } from "../../common/utils/async-handler";
import { usersController } from "./users.controller";

export const usersRouter = Router();

usersRouter.get(
  "/me",
  authGuard,
  asyncHandler(usersController.getMe.bind(usersController)),
);
