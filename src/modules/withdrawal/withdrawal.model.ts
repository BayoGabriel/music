import { InferSchemaType, model, Schema, Types } from 'mongoose';
import { WithdrawalMethod, withdrawalMethodValues, WithdrawalStatus, withdrawalStatusValues } from './withdrawal.constants';

const withdrawalSnapshotSchema = new Schema(
  {
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
  },
  {
    _id: false,
    strict: 'throw'
  }
);

const withdrawalSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
      immutable: true
    },
    method: {
      type: String,
      enum: withdrawalMethodValues,
      required: true,
      immutable: true
    },
    status: {
      type: String,
      enum: withdrawalStatusValues,
      required: true,
      default: WithdrawalStatus.PENDING
    },
    snapshot: {
      type: withdrawalSnapshotSchema,
      required: true,
      immutable: true
    }
  },
  {
    strict: 'throw',
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: false }
  }
);

withdrawalSchema.index({ userId: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });

export type WithdrawalDocument = InferSchemaType<typeof withdrawalSchema> & {
  _id: string;
  userId: Types.ObjectId;
  createdAt: Date;
};

export const WithdrawalModel = model('Withdrawal', withdrawalSchema);

export const isValidSnapshotForMethod = (method: string, snapshot: Record<string, string | undefined>) => {
  const keys = Object.entries(snapshot)
    .filter(([, value]) => value !== undefined)
    .map(([key]) => key)
    .sort();

  const allowedByMethod: Record<string, string[]> = {
    [WithdrawalMethod.PAYPAL]: ['email', 'name', 'paypalId'],
    [WithdrawalMethod.REVOLUT]: ['bic', 'fullName', 'iban', 'tag'],
    [WithdrawalMethod.BANK]: ['accountName', 'accountNumber', 'bankName', 'bicSwift', 'iban', 'sortCode'],
    [WithdrawalMethod.CRYPTO]: ['coin', 'network', 'walletAddress']
  };

  const requiredByMethod: Record<string, string[]> = {
    [WithdrawalMethod.PAYPAL]: ['email', 'name', 'paypalId'],
    [WithdrawalMethod.REVOLUT]: ['bic', 'fullName', 'iban'],
    [WithdrawalMethod.BANK]: ['accountName', 'accountNumber', 'bankName', 'bicSwift', 'iban', 'sortCode'],
    [WithdrawalMethod.CRYPTO]: ['coin', 'network', 'walletAddress']
  };

  const allowed = allowedByMethod[method] ?? [];
  const required = requiredByMethod[method] ?? [];

  if (keys.some((key) => !allowed.includes(key))) {
    return false;
  }

  return required.every((key) => typeof snapshot[key] === 'string' && snapshot[key] !== undefined);
};
