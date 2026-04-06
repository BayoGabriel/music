"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPaymentDetailsModel = void 0;
const mongoose_1 = require("mongoose");
const paypalDetailsSchema = new mongoose_1.Schema({
    email: { type: String, required: true },
    name: { type: String, required: true },
    paypalId: { type: String, required: true }
}, {
    _id: false,
    strict: 'throw'
});
const revolutDetailsSchema = new mongoose_1.Schema({
    fullName: { type: String, required: true },
    iban: { type: String, required: true },
    bic: { type: String, required: true },
    tag: { type: String, required: false }
}, {
    _id: false,
    strict: 'throw'
});
const bankDetailsSchema = new mongoose_1.Schema({
    accountName: { type: String, required: true },
    sortCode: { type: String, required: true },
    accountNumber: { type: String, required: true },
    bankName: { type: String, required: true },
    iban: { type: String, required: true },
    bicSwift: { type: String, required: true }
}, {
    _id: false,
    strict: 'throw'
});
const userPaymentDetailsSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true,
        immutable: true
    },
    paypal: {
        type: paypalDetailsSchema,
        required: false
    },
    revolut: {
        type: revolutDetailsSchema,
        required: false
    },
    bank: {
        type: bankDetailsSchema,
        required: false
    }
}, {
    strict: 'throw',
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: true }
});
exports.UserPaymentDetailsModel = (0, mongoose_1.model)('UserPaymentDetails', userPaymentDetailsSchema);
//# sourceMappingURL=user-payment-details.model.js.map