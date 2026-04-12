import { z } from "zod";

export const songIdParamsSchema = z
  .object({
    id: z.string().trim().min(1),
  })
  .strict();

export const updateSongSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    artist: z.string().trim().min(1).max(200).optional(),
    duration: z.number().positive().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export const createSongBodySchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    artist: z.string().trim().min(1).max(200),
    duration: z.coerce.number().positive(),
  })
  .strict();
