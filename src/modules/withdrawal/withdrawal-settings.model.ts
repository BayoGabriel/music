import { InferSchemaType, model, Schema } from 'mongoose';
import { WITHDRAWAL_SETTINGS_ID } from './withdrawal.constants';

const withdrawalSettingsSchema = new Schema(
  {
    _id: {
      type: String,
      default: WITHDRAWAL_SETTINGS_ID,
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
  },
  {
    strict: 'throw',
    versionKey: false,
    timestamps: { createdAt: false, updatedAt: true }
  }
);

export type WithdrawalSettingsDocument = InferSchemaType<typeof withdrawalSettingsSchema> & {
  _id: string;
  updatedAt: Date;
};

export const WithdrawalSettingsModel = model('WithdrawalSettings', withdrawalSettingsSchema);
