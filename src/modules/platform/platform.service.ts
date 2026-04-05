import { AppError } from '../../common/errors/app-error';
import { safeGetCacheValue, safeSetCacheValue } from '../../database/redis';
import { PlatformSettingsModel, PLATFORM_SETTINGS_ID } from './platform-settings.model';

const MUSIC_ENABLED_CACHE_KEY = 'music_enabled';

class PlatformService {
  public async ensureSettingsDocument() {
    await PlatformSettingsModel.updateOne(
      { _id: PLATFORM_SETTINGS_ID },
      {
        $setOnInsert: {
          _id: PLATFORM_SETTINGS_ID,
          musicEnabled: true
        }
      },
      {
        upsert: true,
        setDefaultsOnInsert: true
      }
    ).exec();
  }

  public async warmMusicEnabledCache() {
    const settings = await this.getSettingsFromDatabase();
    await safeSetCacheValue(MUSIC_ENABLED_CACHE_KEY, String(settings.musicEnabled));
  }

  public async getSettings() {
    return this.getSettingsFromDatabase();
  }

  public async isMusicEnabled() {
    const cachedValue = await safeGetCacheValue(MUSIC_ENABLED_CACHE_KEY);

    if (cachedValue === 'true') {
      return true;
    }

    if (cachedValue === 'false') {
      return false;
    }

    const settings = await this.getSettingsFromDatabase();
    await safeSetCacheValue(MUSIC_ENABLED_CACHE_KEY, String(settings.musicEnabled));
    return settings.musicEnabled;
  }

  public async setMusicEnabled(value: boolean) {
    const updatedSettings = await PlatformSettingsModel.findOneAndUpdate(
      { _id: PLATFORM_SETTINGS_ID },
      {
        $set: {
          musicEnabled: value
        },
        $setOnInsert: {
          _id: PLATFORM_SETTINGS_ID
        }
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    ).exec();

    if (!updatedSettings) {
      throw new AppError(500, 'Unable to update platform settings');
    }

    await safeSetCacheValue(MUSIC_ENABLED_CACHE_KEY, String(updatedSettings.musicEnabled));

    return updatedSettings;
  }

  private async getSettingsFromDatabase() {
    const settings = await PlatformSettingsModel.findById(PLATFORM_SETTINGS_ID).exec();

    if (!settings) {
      throw new AppError(500, 'Platform settings are not initialized');
    }

    return settings;
  }
}

export const platformService = new PlatformService();
