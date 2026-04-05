"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const auth_guard_1 = require("../../common/guards/auth.guard");
const async_handler_1 = require("../../common/utils/async-handler");
const users_controller_1 = require("./users.controller");
exports.usersRouter = (0, express_1.Router)();
exports.usersRouter.get("/me", auth_guard_1.authGuard, (0, async_handler_1.asyncHandler)(users_controller_1.usersController.getMe.bind(users_controller_1.usersController)));
//# sourceMappingURL=users.routes.js.map