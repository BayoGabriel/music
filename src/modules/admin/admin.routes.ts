import { Router } from "express";
import { Role } from "../../common/constants/roles";
import { authGuard } from "../../common/guards/auth.guard";
import { rolesGuard } from "../../common/guards/roles.guard";
import { uploadSongFilesMiddleware } from "../../common/middleware/upload.middleware";
import { validateRequest } from "../../common/middleware/validate.middleware";
import { asyncHandler } from "../../common/utils/async-handler";
import { platformRouter } from "../platform/platform.routes";
import { songsController } from "../songs/songs.controller";
import {
  createSongBodySchema,
  songIdParamsSchema,
  updateSongSchema,
} from "../songs/songs.validation";

export const adminRouter = Router();

adminRouter.use(authGuard, rolesGuard([Role.ADMIN]));
adminRouter.post(
  "/songs",
  uploadSongFilesMiddleware,
  validateRequest({ body: createSongBodySchema }),
  asyncHandler(songsController.createSong.bind(songsController)),
);
adminRouter.patch(
  "/songs/:id",
  validateRequest({ params: songIdParamsSchema, body: updateSongSchema }),
  asyncHandler(songsController.updateSong.bind(songsController)),
);
adminRouter.delete(
  "/songs/:id",
  validateRequest({ params: songIdParamsSchema }),
  asyncHandler(songsController.deleteSong.bind(songsController)),
);
adminRouter.use("/platform", platformRouter);
