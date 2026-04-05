"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformController = void 0;
const platform_service_1 = require("./platform.service");
class PlatformController {
    async enableMusic(_req, res) {
        const settings = await platform_service_1.platformService.setMusicEnabled(true);
        res.status(200).json({
            data: {
                musicEnabled: settings.musicEnabled,
                updatedAt: settings.updatedAt
            }
        });
    }
    async disableMusic(_req, res) {
        const settings = await platform_service_1.platformService.setMusicEnabled(false);
        res.status(200).json({
            data: {
                musicEnabled: settings.musicEnabled,
                updatedAt: settings.updatedAt
            }
        });
    }
}
exports.platformController = new PlatformController();
//# sourceMappingURL=platform.controller.js.map