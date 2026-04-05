"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const async_handler_1 = require("../../common/utils/async-handler");
const validate_middleware_1 = require("../../common/middleware/validate.middleware");
const auth_controller_1 = require("./auth.controller");
const auth_validation_1 = require("./auth.validation");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post("/register", (0, validate_middleware_1.validateRequest)({ body: auth_validation_1.registerSchema }), (0, async_handler_1.asyncHandler)(auth_controller_1.authController.register.bind(auth_controller_1.authController)));
exports.authRouter.post("/login", (0, validate_middleware_1.validateRequest)({ body: auth_validation_1.loginSchema }), (0, async_handler_1.asyncHandler)(auth_controller_1.authController.login.bind(auth_controller_1.authController)));
//# sourceMappingURL=auth.routes.js.map