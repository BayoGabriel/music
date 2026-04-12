"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformService = exports.PLATFORM_SETTINGS_ID = void 0;
const app_error_1 = require("../../common/errors/app-error");
const database_1 = require("../../database");
const redis_1 = require("../../database/redis");
exports.PLATFORM_SETTINGS_ID = "platform_settings";
const MUSIC_ENABLED_CACHE_KEY = "music_enabled";
class PlatformService {
    async ensureSettingsDocument() {
        await database_1.prisma.platformSetting.upsert({
            where: { id: exports.PLATFORM_SETTINGS_ID },
            update: {},
            create: {
                id: exports.PLATFORM_SETTINGS_ID,
                musicEnabled: true,
            },
        });
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
        if (cachedValue === "true") {
            return true;
        }
        if (cachedValue === "false") {
            return false;
        }
        const settings = await this.getSettingsFromDatabase();
        await (0, redis_1.safeSetCacheValue)(MUSIC_ENABLED_CACHE_KEY, String(settings.musicEnabled));
        return settings.musicEnabled;
    }
    async setMusicEnabled(value) {
        const updatedSettings = await database_1.prisma.platformSetting.upsert({
            where: { id: exports.PLATFORM_SETTINGS_ID },
            update: {
                musicEnabled: value,
            },
            create: {
                id: exports.PLATFORM_SETTINGS_ID,
                musicEnabled: value,
            },
        });
        await (0, redis_1.safeSetCacheValue)(MUSIC_ENABLED_CACHE_KEY, String(updatedSettings.musicEnabled));
        return updatedSettings;
    }
    async getSettingsFromDatabase() {
        const settings = await database_1.prisma.platformSetting.findUnique({
            where: { id: exports.PLATFORM_SETTINGS_ID },
        });
        if (!settings) {
            throw new app_error_1.AppError(500, "Platform settings are not initialized");
        }
        return settings;
    }
}
exports.platformService = new PlatformService();
//# sourceMappingURL=platform.service.js.map