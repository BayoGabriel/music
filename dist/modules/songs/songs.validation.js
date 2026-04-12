"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSongBodySchema = exports.updateSongSchema = exports.songIdParamsSchema = void 0;
const zod_1 = require("zod");
exports.songIdParamsSchema = zod_1.z
    .object({
    id: zod_1.z.string().trim().min(1),
})
    .strict();
exports.updateSongSchema = zod_1.z
    .object({
    title: zod_1.z.string().trim().min(1).max(200).optional(),
    artist: zod_1.z.string().trim().min(1).max(200).optional(),
    duration: zod_1.z.number().positive().optional(),
})
    .strict()
    .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
});
exports.createSongBodySchema = zod_1.z
    .object({
    title: zod_1.z.string().trim().min(1).max(200),
    artist: zod_1.z.string().trim().min(1).max(200),
    duration: zod_1.z.coerce.number().positive(),
})
    .strict();
//# sourceMappingURL=songs.validation.js.map