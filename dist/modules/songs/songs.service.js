"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.songsService = void 0;
const app_error_1 = require("../../common/errors/app-error");
const cloudinary_1 = require("../../config/cloudinary");
const env_1 = require("../../config/env");
const platform_service_1 = require("../platform/platform.service");
const song_model_1 = require("./song.model");
const createPublicId = (title, suffix) => {
    const safeTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    return `${safeTitle || "song"}-${Date.now()}-${suffix}`;
};
class SongsService {
    async createSong(payload) {
        const duplicateSong = await song_model_1.SongModel.findOne({
            title: payload.title,
            artist: payload.artist,
            isActive: true,
        }).exec();
        if (duplicateSong) {
            throw new app_error_1.AppError(409, "An active song with the same title and artist already exists");
        }
        const [audioUpload, coverUpload] = await Promise.all([
            (0, cloudinary_1.uploadBufferToCloudinary)({
                buffer: payload.audioFile.buffer,
                folder: env_1.env.cloudinaryAudioFolder,
                publicId: createPublicId(payload.title, "audio"),
                resourceType: "video",
            }),
            (0, cloudinary_1.uploadBufferToCloudinary)({
                buffer: payload.coverImageFile.buffer,
                folder: env_1.env.cloudinaryImageFolder,
                publicId: createPublicId(payload.title, "cover"),
                resourceType: "image",
            }),
        ]);
        const song = await song_model_1.SongModel.create({
            title: payload.title,
            artist: payload.artist,
            duration: payload.duration,
            fileUrl: audioUpload.secure_url,
            coverImageUrl: coverUpload.secure_url,
            isActive: true,
        });
        return this.toSongResponse(song);
    }
    async updateSong(songId, payload) {
        const song = await song_model_1.SongModel.findById(songId).exec();
        if (!song) {
            throw new app_error_1.AppError(404, "Song not found");
        }
        if (payload.title !== undefined) {
            song.title = payload.title;
        }
        if (payload.artist !== undefined) {
            song.artist = payload.artist;
        }
        if (payload.duration !== undefined) {
            song.duration = payload.duration;
        }
        await song.save();
        return this.toSongResponse(song);
    }
    async softDeleteSong(songId) {
        const song = await song_model_1.SongModel.findById(songId).exec();
        if (!song) {
            throw new app_error_1.AppError(404, "Song not found");
        }
        song.isActive = false;
        await song.save();
    }
    async listActiveSongs() {
        await this.assertMusicEnabled();
        const songs = await song_model_1.SongModel.find({ isActive: true })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        return songs.map((song) => this.toSongResponse(song));
    }
    async getActiveSongById(songId) {
        await this.assertMusicEnabled();
        const song = await song_model_1.SongModel.findOne({ _id: songId, isActive: true })
            .lean()
            .exec();
        if (!song) {
            throw new app_error_1.AppError(404, "Song not found");
        }
        return this.toSongResponse(song);
    }
    async getActiveSongStream(songId) {
        await this.assertMusicEnabled();
        const song = await song_model_1.SongModel.findOne({ _id: songId, isActive: true })
            .lean()
            .exec();
        if (!song) {
            throw new app_error_1.AppError(404, "Song not found");
        }
        return {
            fileUrl: song.fileUrl,
        };
    }
    async assertMusicEnabled() {
        const musicEnabled = await platform_service_1.platformService.isMusicEnabled();
        if (!musicEnabled) {
            throw new app_error_1.AppError(403, "Music streaming is currently disabled");
        }
    }
    toSongResponse(song) {
        return {
            id: String(song._id),
            title: song.title,
            artist: song.artist,
            fileUrl: song.fileUrl,
            coverImageUrl: song.coverImageUrl,
            duration: song.duration,
            isActive: song.isActive,
            createdAt: song.createdAt,
        };
    }
}
exports.songsService = new SongsService();
//# sourceMappingURL=songs.service.js.map