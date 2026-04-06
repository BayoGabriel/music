"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WITHDRAWAL_SETTINGS_ID = exports.withdrawalStatusValues = exports.WithdrawalStatus = exports.withdrawalMethodValues = exports.WithdrawalMethod = void 0;
exports.WithdrawalMethod = {
    PAYPAL: 'paypal',
    REVOLUT: 'revolut',
    BANK: 'bank',
    CRYPTO: 'crypto'
};
exports.withdrawalMethodValues = Object.values(exports.WithdrawalMethod);
exports.WithdrawalStatus = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
};
exports.withdrawalStatusValues = Object.values(exports.WithdrawalStatus);
exports.WITHDRAWAL_SETTINGS_ID = 'withdrawal_settings';
//# sourceMappingURL=withdrawal.constants.js.map