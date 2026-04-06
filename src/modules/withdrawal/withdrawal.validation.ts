import { z } from "zod";
import { WithdrawalMethod } from "./withdrawal.constants";

const mongoIdSchema = z
  .object({
    id: z.string().length(24),
  })
  .strict();

const coinParamsSchema = z
  .object({
    coin: z.string().min(1),
  })
  .strict();

const coinNetworkParamsSchema = z
  .object({
    coin: z.string().min(1),
    network: z.string().min(1),
  })
  .strict();

const paypalDetailsSchema = z
  .object({
    email: z.string().email(),
    name: z.string().min(1),
    paypalId: z.string().min(1),
  })
  .strict();

const revolutDetailsSchema = z
  .object({
    fullName: z.string().min(1),
    iban: z.string().min(1),
    bic: z.string().min(1),
    tag: z.string().min(1).optional(),
  })
  .strict();

const bankDetailsSchema = z
  .object({
    accountName: z.string().min(1),
    sortCode: z.string().min(1),
    accountNumber: z.string().min(1),
    bankName: z.string().min(1),
    iban: z.string().min(1),
    bicSwift: z.string().min(1),
  })
  .strict();

const paypalWithdrawalSchema = z
  .object({
    method: z.literal(WithdrawalMethod.PAYPAL),
    useSavedDetails: z.boolean().optional(),
    details: paypalDetailsSchema.optional(),
  })
  .strict()
  .superRefine((value, context) => {
    const usingSavedDetails = value.useSavedDetails === true;

    if (usingSavedDetails && value.details) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Do not provide details when useSavedDetails is true",
        path: ["details"],
      });
    }

    if (!usingSavedDetails && !value.details) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "details are required when useSavedDetails is not true",
        path: ["details"],
      });
    }
  });

const revolutWithdrawalSchema = z
  .object({
    method: z.literal(WithdrawalMethod.REVOLUT),
    useSavedDetails: z.boolean().optional(),
    details: revolutDetailsSchema.optional(),
  })
  .strict()
  .superRefine((value, context) => {
    const usingSavedDetails = value.useSavedDetails === true;

    if (usingSavedDetails && value.details) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Do not provide details when useSavedDetails is true",
        path: ["details"],
      });
    }

    if (!usingSavedDetails && !value.details) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "details are required when useSavedDetails is not true",
        path: ["details"],
      });
    }
  });

const bankWithdrawalSchema = z
  .object({
    method: z.literal(WithdrawalMethod.BANK),
    useSavedDetails: z.boolean().optional(),
    details: bankDetailsSchema.optional(),
  })
  .strict()
  .superRefine((value, context) => {
    const usingSavedDetails = value.useSavedDetails === true;

    if (usingSavedDetails && value.details) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Do not provide details when useSavedDetails is true",
        path: ["details"],
      });
    }

    if (!usingSavedDetails && !value.details) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "details are required when useSavedDetails is not true",
        path: ["details"],
      });
    }
  });

const cryptoWithdrawalSchema = z
  .object({
    method: z.literal(WithdrawalMethod.CRYPTO),
    coin: z.string().min(1),
    network: z.string().min(1),
    walletAddress: z.string().min(1),
    confirmWallet: z.string().min(1),
  })
  .strict();

export const createWithdrawalSchema = z.union([
  paypalWithdrawalSchema,
  revolutWithdrawalSchema,
  bankWithdrawalSchema,
  cryptoWithdrawalSchema,
]);

export const updateWithdrawalMethodsSchema = z
  .object({
    paypalEnabled: z.boolean().optional(),
    revolutEnabled: z.boolean().optional(),
    bankEnabled: z.boolean().optional(),
    cryptoEnabled: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one settings field must be provided",
  });

export const createCoinSchema = z
  .object({
    coin: z.string().min(1),
  })
  .strict();

export const updateCoinSchema = z
  .object({
    isEnabled: z.boolean(),
  })
  .strict();

export const createNetworkSchema = z
  .object({
    name: z.string().min(1),
  })
  .strict();

export const updateNetworkSchema = z
  .object({
    isEnabled: z.boolean(),
  })
  .strict();

export const withdrawalIdParamsSchema = mongoIdSchema;
export const coinPathParamsSchema = coinParamsSchema;
export const coinNetworkPathParamsSchema = coinNetworkParamsSchema;
