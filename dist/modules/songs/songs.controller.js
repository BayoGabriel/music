"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.songsController = void 0;
const app_error_1 = require("../../common/errors/app-error");
const stream_1 = require("../../common/utils/stream");
const songs_service_1 = require("./songs.service");
class SongsController {
    async listSongs(_req, res) {
        const songs = await songs_service_1.songsService.listActiveSongs();
        res.status(200).json({ data: songs });
    }
    async getSongById(req, res) {
        const song = await songs_service_1.songsService.getActiveSongById(req.params.id);
        res.status(200).json({ data: song });
    }
    async streamSong(req, res) {
        const streamSource = await songs_service_1.songsService.getActiveSongStream(req.params.id);
        const range = typeof req.headers.range === "string" ? req.headers.range : undefined;
        if (range && !/^bytes=\d*-\d*$/.test(range)) {
            throw new app_error_1.AppError(416, "Invalid range header");
        }
        if (!range) {
            res.setHeader("Accept-Ranges", "bytes");
        }
        await (0, stream_1.proxyRemoteStream)(streamSource.fileUrl, range, res);
    }
    async createSong(req, res) {
        const files = req.files;
        const audioFile = files?.audio?.[0];
        const coverImageFile = files?.coverImage?.[0];
        if (!audioFile || !coverImageFile) {
            throw new app_error_1.AppError(400, "Both audio and coverImage files are required");
        }
        const song = await songs_service_1.songsService.createSong({
            title: req.body.title,
            artist: req.body.artist,
            duration: req.body.duration,
            audioFile,
            coverImageFile,
        });
        res.status(201).json({ data: song });
    }
    async updateSong(req, res) {
        const song = await songs_service_1.songsService.updateSong(req.params.id, req.body);
        res.status(200).json({ data: song });
    }
    async deleteSong(req, res) {
        await songs_service_1.songsService.softDeleteSong(req.params.id);
        res.status(204).send();
    }
}
exports.songsController = new SongsController();
//# sourceMappingURL=songs.controller.js.map