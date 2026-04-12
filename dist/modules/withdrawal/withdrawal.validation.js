"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coinNetworkPathParamsSchema = exports.coinPathParamsSchema = exports.withdrawalIdParamsSchema = exports.updateNetworkSchema = exports.createNetworkSchema = exports.updateCoinSchema = exports.createCoinSchema = exports.updateWithdrawalMethodsSchema = exports.createWithdrawalSchema = void 0;
const zod_1 = require("zod");
const withdrawal_constants_1 = require("./withdrawal.constants");
const idParamsSchema = zod_1.z
    .object({
    id: zod_1.z.string().trim().min(1),
})
    .strict();
const coinParamsSchema = zod_1.z
    .object({
    coin: zod_1.z.string().min(1),
})
    .strict();
const coinNetworkParamsSchema = zod_1.z
    .object({
    coin: zod_1.z.string().min(1),
    network: zod_1.z.string().min(1),
})
    .strict();
const paypalDetailsSchema = zod_1.z
    .object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string().min(1),
    paypalId: zod_1.z.string().min(1),
})
    .strict();
const revolutDetailsSchema = zod_1.z
    .object({
    fullName: zod_1.z.string().min(1),
    iban: zod_1.z.string().min(1),
    bic: zod_1.z.string().min(1),
    tag: zod_1.z.string().min(1).optional(),
})
    .strict();
const bankDetailsSchema = zod_1.z
    .object({
    accountName: zod_1.z.string().min(1),
    sortCode: zod_1.z.string().min(1),
    accountNumber: zod_1.z.string().min(1),
    bankName: zod_1.z.string().min(1),
    iban: zod_1.z.string().min(1),
    bicSwift: zod_1.z.string().min(1),
})
    .strict();
const paypalWithdrawalSchema = zod_1.z
    .object({
    method: zod_1.z.literal(withdrawal_constants_1.WithdrawalMethod.PAYPAL),
    useSavedDetails: zod_1.z.boolean().optional(),
    details: paypalDetailsSchema.optional(),
})
    .strict()
    .superRefine((value, context) => {
    const usingSavedDetails = value.useSavedDetails === true;
    if (usingSavedDetails && value.details) {
        context.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "Do not provide details when useSavedDetails is true",
            path: ["details"],
        });
    }
    if (!usingSavedDetails && !value.details) {
        context.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "details are required when useSavedDetails is not true",
            path: ["details"],
        });
    }
});
const revolutWithdrawalSchema = zod_1.z
    .object({
    method: zod_1.z.literal(withdrawal_constants_1.WithdrawalMethod.REVOLUT),
    useSavedDetails: zod_1.z.boolean().optional(),
    details: revolutDetailsSchema.optional(),
})
    .strict()
    .superRefine((value, context) => {
    const usingSavedDetails = value.useSavedDetails === true;
    if (usingSavedDetails && value.details) {
        context.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "Do not provide details when useSavedDetails is true",
            path: ["details"],
        });
    }
    if (!usingSavedDetails && !value.details) {
        context.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "details are required when useSavedDetails is not true",
            path: ["details"],
        });
    }
});
const bankWithdrawalSchema = zod_1.z
    .object({
    method: zod_1.z.literal(withdrawal_constants_1.WithdrawalMethod.BANK),
    useSavedDetails: zod_1.z.boolean().optional(),
    details: bankDetailsSchema.optional(),
})
    .strict()
    .superRefine((value, context) => {
    const usingSavedDetails = value.useSavedDetails === true;
    if (usingSavedDetails && value.details) {
        context.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "Do not provide details when useSavedDetails is true",
            path: ["details"],
        });
    }
    if (!usingSavedDetails && !value.details) {
        context.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "details are required when useSavedDetails is not true",
            path: ["details"],
        });
    }
});
const cryptoWithdrawalSchema = zod_1.z
    .object({
    method: zod_1.z.literal(withdrawal_constants_1.WithdrawalMethod.CRYPTO),
    coin: zod_1.z.string().min(1),
    network: zod_1.z.string().min(1),
    walletAddress: zod_1.z.string().min(1),
    confirmWallet: zod_1.z.string().min(1),
})
    .strict();
exports.createWithdrawalSchema = zod_1.z.union([
    paypalWithdrawalSchema,
    revolutWithdrawalSchema,
    bankWithdrawalSchema,
    cryptoWithdrawalSchema,
]);
exports.updateWithdrawalMethodsSchema = zod_1.z
    .object({
    paypalEnabled: zod_1.z.boolean().optional(),
    revolutEnabled: zod_1.z.boolean().optional(),
    bankEnabled: zod_1.z.boolean().optional(),
    cryptoEnabled: zod_1.z.boolean().optional(),
})
    .strict()
    .refine((value) => Object.keys(value).length > 0, {
    message: "At least one settings field must be provided",
});
exports.createCoinSchema = zod_1.z
    .object({
    coin: zod_1.z.string().min(1),
})
    .strict();
exports.updateCoinSchema = zod_1.z
    .object({
    isEnabled: zod_1.z.boolean(),
})
    .strict();
exports.createNetworkSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(1),
})
    .strict();
exports.updateNetworkSchema = zod_1.z
    .object({
    isEnabled: zod_1.z.boolean(),
})
    .strict();
exports.withdrawalIdParamsSchema = idParamsSchema;
exports.coinPathParamsSchema = coinParamsSchema;
exports.coinNetworkPathParamsSchema = coinNetworkParamsSchema;
//# sourceMappingURL=withdrawal.validation.js.map