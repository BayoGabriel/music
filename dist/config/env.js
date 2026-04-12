"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z
    .object({
    NODE_ENV: zod_1.z
        .enum(["development", "test", "production"])
        .default("development"),
    PORT: zod_1.z.coerce.number().int().positive().default(4000),
    DATABASE_URL: zod_1.z.string().min(1, "DATABASE_URL is required"),
    REDIS_URL: zod_1.z.string().min(1, "REDIS_URL is required"),
    JWT_SECRET: zod_1.z
        .string()
        .min(32, "JWT_SECRET must be at least 32 characters long"),
    JWT_EXPIRES_IN: zod_1.z.string().min(1).default("7d"),
    CLOUDINARY_CLOUD_NAME: zod_1.z
        .string()
        .min(1, "CLOUDINARY_CLOUD_NAME is required"),
    CLOUDINARY_API_KEY: zod_1.z.string().min(1, "CLOUDINARY_API_KEY is required"),
    CLOUDINARY_API_SECRET: zod_1.z
        .string()
        .min(1, "CLOUDINARY_API_SECRET is required"),
    CLOUDINARY_AUDIO_FOLDER: zod_1.z.string().min(1).default("music-platform/audio"),
    CLOUDINARY_IMAGE_FOLDER: zod_1.z.string().min(1).default("music-platform/images"),
    BCRYPT_SALT_ROUNDS: zod_1.z.coerce.number().int().min(10).max(15).default(12),
    UPLOAD_MAX_FILE_SIZE_MB: zod_1.z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(50),
    ADMIN_EMAIL: zod_1.z
        .string()
        .trim()
        .toLowerCase()
        .email()
        .optional()
        .or(zod_1.z.literal("")),
    ADMIN_PASSWORD: zod_1.z.string().min(8).max(128).optional().or(zod_1.z.literal("")),
})
    .superRefine((value, context) => {
    const hasAdminEmail = Boolean(value.ADMIN_EMAIL);
    const hasAdminPassword = Boolean(value.ADMIN_PASSWORD);
    if (hasAdminEmail !== hasAdminPassword) {
        context.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "ADMIN_EMAIL and ADMIN_PASSWORD must be provided together",
        });
    }
});
const parsedEnv = envSchema.parse(process.env);
exports.env = {
    nodeEnv: parsedEnv.NODE_ENV,
    port: parsedEnv.PORT,
    databaseUrl: parsedEnv.DATABASE_URL,
    redisUrl: parsedEnv.REDIS_URL,
    jwtSecret: parsedEnv.JWT_SECRET,
    jwtExpiresIn: parsedEnv.JWT_EXPIRES_IN,
    cloudinaryCloudName: parsedEnv.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: parsedEnv.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: parsedEnv.CLOUDINARY_API_SECRET,
    cloudinaryAudioFolder: parsedEnv.CLOUDINARY_AUDIO_FOLDER,
    cloudinaryImageFolder: parsedEnv.CLOUDINARY_IMAGE_FOLDER,
    bcryptSaltRounds: parsedEnv.BCRYPT_SALT_ROUNDS,
    uploadMaxFileSizeMb: parsedEnv.UPLOAD_MAX_FILE_SIZE_MB,
    adminEmail: parsedEnv.ADMIN_EMAIL || undefined,
    adminPassword: parsedEnv.ADMIN_PASSWORD || undefined,
};
//# sourceMappingURL=env.js.map