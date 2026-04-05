import { AppError } from "../../common/errors/app-error";
import { uploadBufferToCloudinary } from "../../config/cloudinary";
import { env } from "../../config/env";
import { platformService } from "../platform/platform.service";
import { SongModel } from "./song.model";

const createPublicId = (title: string, suffix: string) => {
  const safeTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${safeTitle || "song"}-${Date.now()}-${suffix}`;
};

class SongsService {
  public async createSong(payload: {
    title: string;
    artist: string;
    duration: number;
    audioFile: Express.Multer.File;
    coverImageFile: Express.Multer.File;
  }) {
    const duplicateSong = await SongModel.findOne({
      title: payload.title,
      artist: payload.artist,
      isActive: true,
    }).exec();

    if (duplicateSong) {
      throw new AppError(
        409,
        "An active song with the same title and artist already exists",
      );
    }

    const [audioUpload, coverUpload] = await Promise.all([
      uploadBufferToCloudinary({
        buffer: payload.audioFile.buffer,
        folder: env.cloudinaryAudioFolder,
        publicId: createPublicId(payload.title, "audio"),
        resourceType: "video",
      }),
      uploadBufferToCloudinary({
        buffer: payload.coverImageFile.buffer,
        folder: env.cloudinaryImageFolder,
        publicId: createPublicId(payload.title, "cover"),
        resourceType: "image",
      }),
    ]);

    const song = await SongModel.create({
      title: payload.title,
      artist: payload.artist,
      duration: payload.duration,
      fileUrl: audioUpload.secure_url,
      coverImageUrl: coverUpload.secure_url,
      isActive: true,
    });

    return this.toSongResponse(song);
  }

  public async updateSong(
    songId: string,
    payload: { title?: string; artist?: string; duration?: number },
  ) {
    const song = await SongModel.findById(songId).exec();

    if (!song) {
      throw new AppError(404, "Song not found");
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

  public async softDeleteSong(songId: string) {
    const song = await SongModel.findById(songId).exec();

    if (!song) {
      throw new AppError(404, "Song not found");
    }

    song.isActive = false;
    await song.save();
  }

  public async listActiveSongs() {
    await this.assertMusicEnabled();
    const songs = await SongModel.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return songs.map((song) => this.toSongResponse(song));
  }

  public async getActiveSongById(songId: string) {
    await this.assertMusicEnabled();
    const song = await SongModel.findOne({ _id: songId, isActive: true })
      .lean()
      .exec();

    if (!song) {
      throw new AppError(404, "Song not found");
    }

    return this.toSongResponse(song);
  }

  public async getActiveSongStream(songId: string) {
    await this.assertMusicEnabled();
    const song = await SongModel.findOne({ _id: songId, isActive: true })
      .lean()
      .exec();

    if (!song) {
      throw new AppError(404, "Song not found");
    }

    return {
      fileUrl: song.fileUrl,
    };
  }

  private async assertMusicEnabled() {
    const musicEnabled = await platformService.isMusicEnabled();

    if (!musicEnabled) {
      throw new AppError(403, "Music streaming is currently disabled");
    }
  }

  private toSongResponse(song: {
    _id: unknown;
    title: string;
    artist: string;
    fileUrl: string;
    coverImageUrl: string;
    duration: number;
    isActive: boolean;
    createdAt: Date;
  }) {
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

export const songsService = new SongsService();
