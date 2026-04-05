"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformSettingsModel = exports.PLATFORM_SETTINGS_ID = void 0;
const mongoose_1 = require("mongoose");
exports.PLATFORM_SETTINGS_ID = 'platform_settings';
const platformSettingsSchema = new mongoose_1.Schema({
    _id: {
        type: String,
        default: exports.PLATFORM_SETTINGS_ID,
        immutable: true
    },
    musicEnabled: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    strict: 'throw',
    versionKey: false,
    timestamps: { createdAt: false, updatedAt: true }
});
exports.PlatformSettingsModel = (0, mongoose_1.model)('PlatformSettings', platformSettingsSchema);
//# sourceMappingURL=platform-settings.model.js.map