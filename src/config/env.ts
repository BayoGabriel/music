import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
    REDIS_URL: z.string().min(1, "REDIS_URL is required"),
    JWT_SECRET: z
      .string()
      .min(32, "JWT_SECRET must be at least 32 characters long"),
    JWT_EXPIRES_IN: z.string().min(1).default("7d"),
    CLOUDINARY_CLOUD_NAME: z
      .string()
      .min(1, "CLOUDINARY_CLOUD_NAME is required"),
    CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
    CLOUDINARY_API_SECRET: z
      .string()
      .min(1, "CLOUDINARY_API_SECRET is required"),
    CLOUDINARY_AUDIO_FOLDER: z.string().min(1).default("music-platform/audio"),
    CLOUDINARY_IMAGE_FOLDER: z.string().min(1).default("music-platform/images"),
    BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
    UPLOAD_MAX_FILE_SIZE_MB: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(50),
    ADMIN_EMAIL: z
      .string()
      .trim()
      .toLowerCase()
      .email()
      .optional()
      .or(z.literal("")),
    ADMIN_PASSWORD: z.string().min(8).max(128).optional().or(z.literal("")),
  })
  .superRefine((value, context) => {
    const hasAdminEmail = Boolean(value.ADMIN_EMAIL);
    const hasAdminPassword = Boolean(value.ADMIN_PASSWORD);

    if (hasAdminEmail !== hasAdminPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ADMIN_EMAIL and ADMIN_PASSWORD must be provided together",
      });
    }
  });

const parsedEnv = envSchema.parse(process.env);

export const env = {
  nodeEnv: parsedEnv.NODE_ENV,
  port: parsedEnv.PORT,
  mongodbUri: parsedEnv.MONGODB_URI,
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
