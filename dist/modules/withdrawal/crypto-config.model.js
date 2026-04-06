"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoConfigModel = void 0;
const mongoose_1 = require("mongoose");
const cryptoNetworkSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    isEnabled: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    _id: false,
    strict: 'throw'
});
const cryptoConfigSchema = new mongoose_1.Schema({
    coin: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    isEnabled: {
        type: Boolean,
        required: true,
        default: true
    },
    networks: {
        type: [cryptoNetworkSchema],
        required: true,
        default: []
    }
}, {
    strict: 'throw',
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: true }
});
exports.CryptoConfigModel = (0, mongoose_1.model)('CryptoConfig', cryptoConfigSchema);
//# sourceMappingURL=crypto-config.model.js.map