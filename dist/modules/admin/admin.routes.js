"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const roles_1 = require("../../common/constants/roles");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const upload_middleware_1 = require("../../common/middleware/upload.middleware");
const validate_middleware_1 = require("../../common/middleware/validate.middleware");
const async_handler_1 = require("../../common/utils/async-handler");
const platform_routes_1 = require("../platform/platform.routes");
const songs_controller_1 = require("../songs/songs.controller");
const withdrawal_admin_controller_1 = require("../withdrawal/withdrawal.admin.controller");
const songs_validation_1 = require("../songs/songs.validation");
const withdrawal_validation_1 = require("../withdrawal/withdrawal.validation");
exports.adminRouter = (0, express_1.Router)();
exports.adminRouter.use(auth_guard_1.authGuard, (0, roles_guard_1.rolesGuard)([roles_1.Role.ADMIN]));
exports.adminRouter.post("/songs", upload_middleware_1.uploadSongFilesMiddleware, (0, validate_middleware_1.validateRequest)({ body: songs_validation_1.createSongBodySchema }), (0, async_handler_1.asyncHandler)(songs_controller_1.songsController.createSong.bind(songs_controller_1.songsController)));
exports.adminRouter.patch("/songs/:id", (0, validate_middleware_1.validateRequest)({ params: songs_validation_1.songIdParamsSchema, body: songs_validation_1.updateSongSchema }), (0, async_handler_1.asyncHandler)(songs_controller_1.songsController.updateSong.bind(songs_controller_1.songsController)));
exports.adminRouter.delete("/songs/:id", (0, validate_middleware_1.validateRequest)({ params: songs_validation_1.songIdParamsSchema }), (0, async_handler_1.asyncHandler)(songs_controller_1.songsController.deleteSong.bind(songs_controller_1.songsController)));
exports.adminRouter.patch("/settings/methods", (0, validate_middleware_1.validateRequest)({ body: withdrawal_validation_1.updateWithdrawalMethodsSchema }), (0, async_handler_1.asyncHandler)(withdrawal_admin_controller_1.withdrawalAdminController.updateMethodSettings.bind(withdrawal_admin_controller_1.withdrawalAdminController)));
exports.adminRouter.post("/crypto/coins", (0, validate_middleware_1.validateRequest)({ body: withdrawal_validation_1.createCoinSchema }), (0, async_handler_1.asyncHandler)(withdrawal_admin_controller_1.withdrawalAdminController.createCoin.bind(withdrawal_admin_controller_1.withdrawalAdminController)));
exports.adminRouter.patch("/crypto/coins/:coin", (0, validate_middleware_1.validateRequest)({ params: withdrawal_validation_1.coinPathParamsSchema, body: withdrawal_validation_1.updateCoinSchema }), (0, async_handler_1.asyncHandler)(withdrawal_admin_controller_1.withdrawalAdminController.updateCoin.bind(withdrawal_admin_controller_1.withdrawalAdminController)));
exports.adminRouter.post("/crypto/coins/:coin/networks", (0, validate_middleware_1.validateRequest)({ params: withdrawal_validation_1.coinPathParamsSchema, body: withdrawal_validation_1.createNetworkSchema }), (0, async_handler_1.asyncHandler)(withdrawal_admin_controller_1.withdrawalAdminController.addNetwork.bind(withdrawal_admin_controller_1.withdrawalAdminController)));
exports.adminRouter.patch("/crypto/coins/:coin/networks/:network", (0, validate_middleware_1.validateRequest)({
    params: withdrawal_validation_1.coinNetworkPathParamsSchema,
    body: withdrawal_validation_1.updateNetworkSchema,
}), (0, async_handler_1.asyncHandler)(withdrawal_admin_controller_1.withdrawalAdminController.updateNetwork.bind(withdrawal_admin_controller_1.withdrawalAdminController)));
exports.adminRouter.get("/withdrawals", (0, async_handler_1.asyncHandler)(withdrawal_admin_controller_1.withdrawalAdminController.listWithdrawals.bind(withdrawal_admin_controller_1.withdrawalAdminController)));
exports.adminRouter.get("/withdrawals/:id", (0, validate_middleware_1.validateRequest)({ params: withdrawal_validation_1.withdrawalIdParamsSchema }), (0, async_handler_1.asyncHandler)(withdrawal_admin_controller_1.withdrawalAdminController.getWithdrawalById.bind(withdrawal_admin_controller_1.withdrawalAdminController)));
exports.adminRouter.patch("/withdrawals/:id/approve", (0, validate_middleware_1.validateRequest)({ params: withdrawal_validation_1.withdrawalIdParamsSchema }), (0, async_handler_1.asyncHandler)(withdrawal_admin_controller_1.withdrawalAdminController.approveWithdrawal.bind(withdrawal_admin_controller_1.withdrawalAdminController)));
exports.adminRouter.patch("/withdrawals/:id/reject", (0, validate_middleware_1.validateRequest)({ params: withdrawal_validation_1.withdrawalIdParamsSchema }), (0, async_handler_1.asyncHandler)(withdrawal_admin_controller_1.withdrawalAdminController.rejectWithdrawal.bind(withdrawal_admin_controller_1.withdrawalAdminController)));
exports.adminRouter.use("/platform", platform_routes_1.platformRouter);
//# sourceMappingURL=admin.routes.js.map