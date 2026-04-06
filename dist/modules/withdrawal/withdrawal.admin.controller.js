"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawalAdminController = void 0;
const withdrawal_service_1 = require("./withdrawal.service");
class WithdrawalAdminController {
    async updateMethodSettings(req, res) {
        const data = await withdrawal_service_1.withdrawalService.updateMethodSettings(req.body);
        res.status(200).json({ data });
    }
    async createCoin(req, res) {
        const data = await withdrawal_service_1.withdrawalService.createCoin(req.body);
        res.status(201).json({ data });
    }
    async updateCoin(req, res) {
        const data = await withdrawal_service_1.withdrawalService.updateCoin(req.params.coin, req.body);
        res.status(200).json({ data });
    }
    async addNetwork(req, res) {
        const data = await withdrawal_service_1.withdrawalService.addNetwork(req.params.coin, req.body);
        res.status(201).json({ data });
    }
    async updateNetwork(req, res) {
        const data = await withdrawal_service_1.withdrawalService.updateNetwork(req.params.coin, req.params.network, req.body);
        res.status(200).json({ data });
    }
    async listWithdrawals(_req, res) {
        const data = await withdrawal_service_1.withdrawalService.listWithdrawals();
        res.status(200).json({ data });
    }
    async getWithdrawalById(req, res) {
        const data = await withdrawal_service_1.withdrawalService.getWithdrawalById(req.params.id);
        res.status(200).json({ data });
    }
    async approveWithdrawal(req, res) {
        const data = await withdrawal_service_1.withdrawalService.approveWithdrawal(req.params.id);
        res.status(200).json({ data });
    }
    async rejectWithdrawal(req, res) {
        const data = await withdrawal_service_1.withdrawalService.rejectWithdrawal(req.params.id);
        res.status(200).json({ data });
    }
}
exports.withdrawalAdminController = new WithdrawalAdminController();
//# sourceMappingURL=withdrawal.admin.controller.js.map