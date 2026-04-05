"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformService = void 0;
const app_error_1 = require("../../common/errors/app-error");
const redis_1 = require("../../database/redis");
const platform_settings_model_1 = require("./platform-settings.model");
const MUSIC_ENABLED_CACHE_KEY = 'music_enabled';
class PlatformService {
    async ensureSettingsDocument() {
        await platform_settings_model_1.PlatformSettingsModel.updateOne({ _id: platform_settings_model_1.PLATFORM_SETTINGS_ID }, {
            $setOnInsert: {
                _id: platform_settings_model_1.PLATFORM_SETTINGS_ID,
                musicEnabled: true
            }
        }, {
            upsert: true,
            setDefaultsOnInsert: true
        }).exec();
    }
    async warmMusicEnabledCache() {
        const settings = await this.getSettingsFromDatabase();
        await (0, redis_1.safeSetCacheValue)(MUSIC_ENABLED_CACHE_KEY, String(settings.musicEnabled));
    }
    async getSettings() {
        return this.getSettingsFromDatabase();
    }
    async isMusicEnabled() {
        const cachedValue = await (0, redis_1.safeGetCacheValue)(MUSIC_ENABLED_CACHE_KEY);
        if (cachedValue === 'true') {
            return true;
        }
        if (cachedValue === 'false') {
            return false;
        }
        const settings = await this.getSettingsFromDatabase();
        await (0, redis_1.safeSetCacheValue)(MUSIC_ENABLED_CACHE_KEY, String(settings.musicEnabled));
        return settings.musicEnabled;
    }
    async setMusicEnabled(value) {
        const updatedSettings = await platform_settings_model_1.PlatformSettingsModel.findOneAndUpdate({ _id: platform_settings_model_1.PLATFORM_SETTINGS_ID }, {
            $set: {
                musicEnabled: value
            },
            $setOnInsert: {
                _id: platform_settings_model_1.PLATFORM_SETTINGS_ID
            }
        }, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        }).exec();
        if (!updatedSettings) {
            throw new app_error_1.AppError(500, 'Unable to update platform settings');
        }
        await (0, redis_1.safeSetCacheValue)(MUSIC_ENABLED_CACHE_KEY, String(updatedSettings.musicEnabled));
        return updatedSettings;
    }
    async getSettingsFromDatabase() {
        const settings = await platform_settings_model_1.PlatformSettingsModel.findById(platform_settings_model_1.PLATFORM_SETTINGS_ID).exec();
        if (!settings) {
            throw new app_error_1.AppError(500, 'Platform settings are not initialized');
        }
        return settings;
    }
}
exports.platformService = new PlatformService();
//# sourceMappingURL=platform.service.js.map