"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidSnapshotForMethod = exports.WithdrawalModel = void 0;
const mongoose_1 = require("mongoose");
const withdrawal_constants_1 = require("./withdrawal.constants");
const withdrawalSnapshotSchema = new mongoose_1.Schema({
    email: { type: String, required: false },
    name: { type: String, required: false },
    paypalId: { type: String, required: false },
    fullName: { type: String, required: false },
    iban: { type: String, required: false },
    bic: { type: String, required: false },
    tag: { type: String, required: false },
    accountName: { type: String, required: false },
    sortCode: { type: String, required: false },
    accountNumber: { type: String, required: false },
    bankName: { type: String, required: false },
    bicSwift: { type: String, required: false },
    coin: { type: String, required: false },
    network: { type: String, required: false },
    walletAddress: { type: String, required: false }
}, {
    _id: false,
    strict: 'throw'
});
const withdrawalSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
        immutable: true
    },
    method: {
        type: String,
        enum: withdrawal_constants_1.withdrawalMethodValues,
        required: true,
        immutable: true
    },
    status: {
        type: String,
        enum: withdrawal_constants_1.withdrawalStatusValues,
        required: true,
        default: withdrawal_constants_1.WithdrawalStatus.PENDING
    },
    snapshot: {
        type: withdrawalSnapshotSchema,
        required: true,
        immutable: true
    }
}, {
    strict: 'throw',
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: false }
});
withdrawalSchema.index({ userId: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });
exports.WithdrawalModel = (0, mongoose_1.model)('Withdrawal', withdrawalSchema);
const isValidSnapshotForMethod = (method, snapshot) => {
    const keys = Object.entries(snapshot)
        .filter(([, value]) => value !== undefined)
        .map(([key]) => key)
        .sort();
    const allowedByMethod = {
        [withdrawal_constants_1.WithdrawalMethod.PAYPAL]: ['email', 'name', 'paypalId'],
        [withdrawal_constants_1.WithdrawalMethod.REVOLUT]: ['bic', 'fullName', 'iban', 'tag'],
        [withdrawal_constants_1.WithdrawalMethod.BANK]: ['accountName', 'accountNumber', 'bankName', 'bicSwift', 'iban', 'sortCode'],
        [withdrawal_constants_1.WithdrawalMethod.CRYPTO]: ['coin', 'network', 'walletAddress']
    };
    const requiredByMethod = {
        [withdrawal_constants_1.WithdrawalMethod.PAYPAL]: ['email', 'name', 'paypalId'],
        [withdrawal_constants_1.WithdrawalMethod.REVOLUT]: ['bic', 'fullName', 'iban'],
        [withdrawal_constants_1.WithdrawalMethod.BANK]: ['accountName', 'accountNumber', 'bankName', 'bicSwift', 'iban', 'sortCode'],
        [withdrawal_constants_1.WithdrawalMethod.CRYPTO]: ['coin', 'network', 'walletAddress']
    };
    const allowed = allowedByMethod[method] ?? [];
    const required = requiredByMethod[method] ?? [];
    if (keys.some((key) => !allowed.includes(key))) {
        return false;
    }
    return required.every((key) => typeof snapshot[key] === 'string' && snapshot[key] !== undefined);
};
exports.isValidSnapshotForMethod = isValidSnapshotForMethod;
//# sourceMappingURL=withdrawal.model.js.map