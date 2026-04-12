export const PLATFORM_SETTINGS_ID = "platform_settings";

export type PlatformSettingsDocument = {
  id: string;
  musicEnabled: boolean;
  updatedAt: Date;
};
