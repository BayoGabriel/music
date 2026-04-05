"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMusicEnabled = void 0;
const platform_service_1 = require("../../modules/platform/platform.service");
const app_error_1 = require("../errors/app-error");
const checkMusicEnabled = async (_req, _res, next) => {
    try {
        const musicEnabled = await platform_service_1.platformService.isMusicEnabled();
        if (!musicEnabled) {
            next(new app_error_1.AppError(403, 'Music streaming is currently disabled'));
            return;
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkMusicEnabled = checkMusicEnabled;
//# sourceMappingURL=music-enabled.guard.js.map