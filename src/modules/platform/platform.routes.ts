import { Router } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { platformController } from "./platform.controller";

export const platformRouter = Router();

platformRouter.patch(
  "/enable",
  asyncHandler(platformController.enableMusic.bind(platformController)),
);
platformRouter.patch(
  "/disable",
  asyncHandler(platformController.disableMusic.bind(platformController)),
);
