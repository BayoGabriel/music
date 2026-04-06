"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalSettingsModel = void 0;
const mongoose_1 = require("mongoose");
const withdrawal_constants_1 = require("./withdrawal.constants");
const withdrawalSettingsSchema = new mongoose_1.Schema({
    _id: {
        type: String,
        default: withdrawal_constants_1.WITHDRAWAL_SETTINGS_ID,
        immutable: true
    },
    paypalEnabled: {
        type: Boolean,
        required: true,
        default: true
    },
    revolutEnabled: {
        type: Boolean,
        required: true,
        default: true
    },
    bankEnabled: {
        type: Boolean,
        required: true,
        default: true
    },
    cryptoEnabled: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    strict: 'throw',
    versionKey: false,
    timestamps: { createdAt: false, updatedAt: true }
});
exports.WithdrawalSettingsModel = (0, mongoose_1.model)('WithdrawalSettings', withdrawalSettingsSchema);
//# sourceMappingURL=withdrawal-settings.model.js.map