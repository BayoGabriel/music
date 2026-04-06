"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawalController = void 0;
const withdrawal_service_1 = require("./withdrawal.service");
class WithdrawalController {
    async getAvailableMethods(_req, res) {
        const data = await withdrawal_service_1.withdrawalService.getAvailableMethods();
        res.status(200).json({ data });
    }
    async createWithdrawal(req, res) {
        const data = await withdrawal_service_1.withdrawalService.createWithdrawal(req.authUser?.id, req.body);
        res.status(201).json({ data });
    }
}
exports.withdrawalController = new WithdrawalController();
//# sourceMappingURL=withdrawal.controller.js.map