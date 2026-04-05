import { InferSchemaType, model, Schema } from "mongoose";

const songSchema = new Schema(
  {
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
  },
  {
    strict: "throw",
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: false },
  },
);

songSchema.index({ isActive: 1 });
songSchema.index({ createdAt: -1 });

export type SongDocument = InferSchemaType<typeof songSchema> & {
  _id: string;
  createdAt: Date;
};

export const SongModel = model("Song", songSchema);
