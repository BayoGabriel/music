"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformRouter = void 0;
const express_1 = require("express");
const async_handler_1 = require("../../common/utils/async-handler");
const platform_controller_1 = require("./platform.controller");
exports.platformRouter = (0, express_1.Router)();
exports.platformRouter.patch("/enable", (0, async_handler_1.asyncHandler)(platform_controller_1.platformController.enableMusic.bind(platform_controller_1.platformController)));
exports.platformRouter.patch("/disable", (0, async_handler_1.asyncHandler)(platform_controller_1.platformController.disableMusic.bind(platform_controller_1.platformController)));
//# sourceMappingURL=platform.routes.js.map