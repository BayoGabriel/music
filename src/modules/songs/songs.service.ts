import { AppError } from "../../common/errors/app-error";
import { uploadBufferToCloudinary } from "../../config/cloudinary";
import { env } from "../../config/env";
import { prisma } from "../../database";
import { platformService } from "../platform/platform.service";

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
    const duplicateSong = await prisma.song.findFirst({
      where: {
        title: payload.title,
        artist: payload.artist,
        isActive: true,
      },
    });

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

    const song = await prisma.song.create({
      data: {
        title: payload.title,
        artist: payload.artist,
        duration: payload.duration,
        fileUrl: audioUpload.secure_url,
        coverImageUrl: coverUpload.secure_url,
        isActive: true,
      },
    });

    return this.toSongResponse(song);
  }

  public async updateSong(
    songId: string,
    payload: { title?: string; artist?: string; duration?: number },
  ) {
    const existingSong = await prisma.song.findUnique({
      where: { id: songId },
    });

    if (!existingSong) {
      throw new AppError(404, "Song not found");
    }

    const song = await prisma.song.update({
      where: { id: songId },
      data: {
        ...(payload.title !== undefined ? { title: payload.title } : {}),
        ...(payload.artist !== undefined ? { artist: payload.artist } : {}),
        ...(payload.duration !== undefined
          ? { duration: payload.duration }
          : {}),
      },
    });

    return this.toSongResponse(song);
  }

  public async softDeleteSong(songId: string) {
    const song = await prisma.song.findUnique({ where: { id: songId } });

    if (!song) {
      throw new AppError(404, "Song not found");
    }

    await prisma.song.update({
      where: { id: songId },
      data: {
        isActive: false,
      },
    });
  }

  public async listActiveSongs() {
    await this.assertMusicEnabled();
    const songs = await prisma.song.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return songs.map((song) => this.toSongResponse(song));
  }

  public async getActiveSongById(songId: string) {
    await this.assertMusicEnabled();
    const song = await prisma.song.findFirst({
      where: { id: songId, isActive: true },
    });

    if (!song) {
      throw new AppError(404, "Song not found");
    }

    return this.toSongResponse(song);
  }

  public async getActiveSongStream(songId: string) {
    await this.assertMusicEnabled();
    const song = await prisma.song.findFirst({
      where: { id: songId, isActive: true },
    });

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
    id: string;
    title: string;
    artist: string;
    fileUrl: string;
    coverImageUrl: string;
    duration: number;
    isActive: boolean;
    createdAt: Date;
  }) {
    return {
      id: song.id,
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
