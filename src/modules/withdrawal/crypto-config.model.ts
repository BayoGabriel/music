import { InferSchemaType, model, Schema } from 'mongoose';

const cryptoNetworkSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    isEnabled: {
      type: Boolean,
      required: true,
      default: true
    }
  },
  {
    _id: false,
    strict: 'throw'
  }
);

const cryptoConfigSchema = new Schema(
  {
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
  },
  {
    strict: 'throw',
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: true }
  }
);

export type CryptoConfigDocument = InferSchemaType<typeof cryptoConfigSchema> & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

export const CryptoConfigModel = model('CryptoConfig', cryptoConfigSchema);
