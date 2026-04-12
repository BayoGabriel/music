import { AppError } from "../../common/errors/app-error";
import { prisma } from "../../database";
import { safeGetCacheValue, safeSetCacheValue } from "../../database/redis";

export const PLATFORM_SETTINGS_ID = "platform_settings";

const MUSIC_ENABLED_CACHE_KEY = "music_enabled";

class PlatformService {
  public async ensureSettingsDocument() {
    await prisma.platformSetting.upsert({
      where: { id: PLATFORM_SETTINGS_ID },
      update: {},
      create: {
        id: PLATFORM_SETTINGS_ID,
        musicEnabled: true,
      },
    });
  }

  public async warmMusicEnabledCache() {
    const settings = await this.getSettingsFromDatabase();
    await safeSetCacheValue(
      MUSIC_ENABLED_CACHE_KEY,
      String(settings.musicEnabled),
    );
  }

  public async getSettings() {
    return this.getSettingsFromDatabase();
  }

  public async isMusicEnabled() {
    const cachedValue = await safeGetCacheValue(MUSIC_ENABLED_CACHE_KEY);

    if (cachedValue === "true") {
      return true;
    }

    if (cachedValue === "false") {
      return false;
    }

    const settings = await this.getSettingsFromDatabase();
    await safeSetCacheValue(
      MUSIC_ENABLED_CACHE_KEY,
      String(settings.musicEnabled),
    );
    return settings.musicEnabled;
  }

  public async setMusicEnabled(value: boolean) {
    const updatedSettings = await prisma.platformSetting.upsert({
      where: { id: PLATFORM_SETTINGS_ID },
      update: {
        musicEnabled: value,
      },
      create: {
        id: PLATFORM_SETTINGS_ID,
        musicEnabled: value,
      },
    });

    await safeSetCacheValue(
      MUSIC_ENABLED_CACHE_KEY,
      String(updatedSettings.musicEnabled),
    );

    return updatedSettings;
  }

  private async getSettingsFromDatabase() {
    const settings = await prisma.platformSetting.findUnique({
      where: { id: PLATFORM_SETTINGS_ID },
    });

    if (!settings) {
      throw new AppError(500, "Platform settings are not initialized");
    }

    return settings;
  }
}

export const platformService = new PlatformService();
