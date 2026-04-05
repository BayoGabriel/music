import { Router } from "express";
import { checkMusicEnabled } from "../../common/guards/music-enabled.guard";
import { validateRequest } from "../../common/middleware/validate.middleware";
import { asyncHandler } from "../../common/utils/async-handler";
import { songsController } from "./songs.controller";
import { songIdParamsSchema } from "./songs.validation";

export const songsRouter = Router();

songsRouter.use(checkMusicEnabled);
songsRouter.get(
  "/",
  asyncHandler(songsController.listSongs.bind(songsController)),
);
songsRouter.get(
  "/:id",
  validateRequest({ params: songIdParamsSchema }),
  asyncHandler(songsController.getSongById.bind(songsController)),
);
songsRouter.get(
  "/:id/stream",
  validateRequest({ params: songIdParamsSchema }),
  asyncHandler(songsController.streamSong.bind(songsController)),
);
