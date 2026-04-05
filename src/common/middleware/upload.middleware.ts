import multer from "multer";
import { env } from "../../config/env";
import { AppError } from "../errors/app-error";

const allowedAudioMimeTypes = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
];

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: env.uploadMaxFileSizeMb * 1024 * 1024,
    files: 2,
  },
  fileFilter: (_req, file, callback) => {
    if (file.fieldname === "audio") {
      if (!allowedAudioMimeTypes.includes(file.mimetype)) {
        callback(new AppError(400, "Unsupported audio file type"));
        return;
      }

      callback(null, true);
      return;
    }

    if (file.fieldname === "coverImage") {
      if (!file.mimetype.startsWith("image/")) {
        callback(new AppError(400, "Unsupported cover image file type"));
        return;
      }

      callback(null, true);
      return;
    }

    callback(new AppError(400, "Unexpected upload field"));
  },
});

export const uploadSongFilesMiddleware = upload.fields([
  { name: "audio", maxCount: 1 },
  { name: "coverImage", maxCount: 1 },
]);
