import { InferSchemaType, model, Schema } from 'mongoose';

export const PLATFORM_SETTINGS_ID = 'platform_settings';

const platformSettingsSchema = new Schema(
  {
    _id: {
      type: String,
      default: PLATFORM_SETTINGS_ID,
      immutable: true
    },
    musicEnabled: {
      type: Boolean,
      required: true,
      default: true
    }
  },
  {
    strict: 'throw',
    versionKey: false,
    timestamps: { createdAt: false, updatedAt: true }
  }
);

export type PlatformSettingsDocument = InferSchemaType<typeof platformSettingsSchema> & {
  _id: string;
  updatedAt: Date;
};

export const PlatformSettingsModel = model('PlatformSettings', platformSettingsSchema);
