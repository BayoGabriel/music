"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SongModel = void 0;
const mongoose_1 = require("mongoose");
const songSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    artist: {
        type: String,
        required: true,
        trim: true,
    },
    fileUrl: {
        type: String,
        required: true,
        trim: true,
    },
    coverImageUrl: {
        type: String,
        required: true,
        trim: true,
    },
    duration: {
        type: Number,
        required: true,
        min: 0,
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true,
    },
}, {
    strict: "throw",
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: false },
});
songSchema.index({ isActive: 1 });
songSchema.index({ createdAt: -1 });
exports.SongModel = (0, mongoose_1.model)("Song", songSchema);
//# sourceMappingURL=song.model.js.map