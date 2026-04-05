"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSongFilesMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const env_1 = require("../../config/env");
const app_error_1 = require("../errors/app-error");
const allowedAudioMimeTypes = [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
];
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: env_1.env.uploadMaxFileSizeMb * 1024 * 1024,
        files: 2,
    },
    fileFilter: (_req, file, callback) => {
        if (file.fieldname === "audio") {
            if (!allowedAudioMimeTypes.includes(file.mimetype)) {
                callback(new app_error_1.AppError(400, "Unsupported audio file type"));
                return;
            }
            callback(null, true);
            return;
        }
        if (file.fieldname === "coverImage") {
            if (!file.mimetype.startsWith("image/")) {
                callback(new app_error_1.AppError(400, "Unsupported cover image file type"));
                return;
            }
            callback(null, true);
            return;
        }
        callback(new app_error_1.AppError(400, "Unexpected upload field"));
    },
});
exports.uploadSongFilesMiddleware = upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
]);
//# sourceMappingURL=upload.middleware.js.map