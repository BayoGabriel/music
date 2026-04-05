"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.songsRouter = void 0;
const express_1 = require("express");
const music_enabled_guard_1 = require("../../common/guards/music-enabled.guard");
const validate_middleware_1 = require("../../common/middleware/validate.middleware");
const async_handler_1 = require("../../common/utils/async-handler");
const songs_controller_1 = require("./songs.controller");
const songs_validation_1 = require("./songs.validation");
exports.songsRouter = (0, express_1.Router)();
exports.songsRouter.use(music_enabled_guard_1.checkMusicEnabled);
exports.songsRouter.get("/", (0, async_handler_1.asyncHandler)(songs_controller_1.songsController.listSongs.bind(songs_controller_1.songsController)));
exports.songsRouter.get("/:id", (0, validate_middleware_1.validateRequest)({ params: songs_validation_1.songIdParamsSchema }), (0, async_handler_1.asyncHandler)(songs_controller_1.songsController.getSongById.bind(songs_controller_1.songsController)));
exports.songsRouter.get("/:id/stream", (0, validate_middleware_1.validateRequest)({ params: songs_validation_1.songIdParamsSchema }), (0, async_handler_1.asyncHandler)(songs_controller_1.songsController.streamSong.bind(songs_controller_1.songsController)));
//# sourceMappingURL=songs.routes.js.map