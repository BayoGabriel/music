"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidSnapshotForMethod = void 0;
const withdrawal_constants_1 = require("./withdrawal.constants");
const isValidSnapshotForMethod = (method, snapshot) => {
    const keys = Object.entries(snapshot)
        .filter(([, value]) => value !== undefined)
        .map(([key]) => key)
        .sort();
    const allowedByMethod = {
        [withdrawal_constants_1.WithdrawalMethod.PAYPAL]: ["email", "name", "paypalId"],
        [withdrawal_constants_1.WithdrawalMethod.REVOLUT]: ["bic", "fullName", "iban", "tag"],
        [withdrawal_constants_1.WithdrawalMethod.BANK]: [
            "accountName",
            "accountNumber",
            "bankName",
            "bicSwift",
            "iban",
            "sortCode",
        ],
        [withdrawal_constants_1.WithdrawalMethod.CRYPTO]: ["coin", "network", "walletAddress"],
    };
    const requiredByMethod = {
        [withdrawal_constants_1.WithdrawalMethod.PAYPAL]: ["email", "name", "paypalId"],
        [withdrawal_constants_1.WithdrawalMethod.REVOLUT]: ["bic", "fullName", "iban"],
        [withdrawal_constants_1.WithdrawalMethod.BANK]: [
            "accountName",
            "accountNumber",
            "bankName",
            "bicSwift",
            "iban",
            "sortCode",
        ],
        [withdrawal_constants_1.WithdrawalMethod.CRYPTO]: ["coin", "network", "walletAddress"],
    };
    const allowed = allowedByMethod[method] ?? [];
    const required = requiredByMethod[method] ?? [];
    if (keys.some((key) => !allowed.includes(key))) {
        return false;
    }
    return required.every((key) => typeof snapshot[key] === "string" && snapshot[key] !== undefined);
};
exports.isValidSnapshotForMethod = isValidSnapshotForMethod;
//# sourceMappingURL=withdrawal.model.js.map