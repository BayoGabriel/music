import { Request, Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { proxyRemoteStream } from "../../common/utils/stream";
import { songsService } from "./songs.service";

class SongsController {
  public async listSongs(_req: Request, res: Response) {
    const songs = await songsService.listActiveSongs();
    res.status(200).json({ data: songs });
  }

  public async getSongById(req: Request, res: Response) {
    const song = await songsService.getActiveSongById(req.params.id);
    res.status(200).json({ data: song });
  }

  public async streamSong(req: Request, res: Response) {
    const streamSource = await songsService.getActiveSongStream(req.params.id);
    const range =
      typeof req.headers.range === "string" ? req.headers.range : undefined;

    if (range && !/^bytes=\d*-\d*$/.test(range)) {
      throw new AppError(416, "Invalid range header");
    }

    if (!range) {
      res.setHeader("Accept-Ranges", "bytes");
    }

    await proxyRemoteStream(streamSource.fileUrl, range, res);
  }

  public async createSong(req: Request, res: Response) {
    const files = req.files as
      | Record<string, Express.Multer.File[]>
      | undefined;
    const audioFile = files?.audio?.[0];
    const coverImageFile = files?.coverImage?.[0];

    if (!audioFile || !coverImageFile) {
      throw new AppError(400, "Both audio and coverImage files are required");
    }

    const song = await songsService.createSong({
      title: req.body.title,
      artist: req.body.artist,
      duration: req.body.duration,
      audioFile,
      coverImageFile,
    });

    res.status(201).json({ data: song });
  }

  public async updateSong(req: Request, res: Response) {
    const song = await songsService.updateSong(req.params.id, req.body);
    res.status(200).json({ data: song });
  }

  public async deleteSong(req: Request, res: Response) {
    await songsService.softDeleteSong(req.params.id);
    res.status(204).send();
  }
}

export const songsController = new SongsController();
