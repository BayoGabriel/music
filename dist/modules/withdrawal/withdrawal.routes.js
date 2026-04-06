"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawalRouter = void 0;
const express_1 = require("express");
const auth_guard_1 = require("../../common/guards/auth.guard");
const validate_middleware_1 = require("../../common/middleware/validate.middleware");
const async_handler_1 = require("../../common/utils/async-handler");
const withdrawal_controller_1 = require("./withdrawal.controller");
const withdrawal_validation_1 = require("./withdrawal.validation");
exports.withdrawalRouter = (0, express_1.Router)();
exports.withdrawalRouter.use(auth_guard_1.authGuard);
exports.withdrawalRouter.get('/methods', (0, async_handler_1.asyncHandler)(withdrawal_controller_1.withdrawalController.getAvailableMethods.bind(withdrawal_controller_1.withdrawalController)));
exports.withdrawalRouter.post('/', (0, validate_middleware_1.validateRequest)({ body: withdrawal_validation_1.createWithdrawalSchema }), (0, async_handler_1.asyncHandler)(withdrawal_controller_1.withdrawalController.createWithdrawal.bind(withdrawal_controller_1.withdrawalController)));
//# sourceMappingURL=withdrawal.routes.js.map