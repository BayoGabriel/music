import { InferSchemaType, model, Schema, Types } from 'mongoose';

const paypalDetailsSchema = new Schema(
  {
    email: { type: String, required: true },
    name: { type: String, required: true },
    paypalId: { type: String, required: true }
  },
  {
    _id: false,
    strict: 'throw'
  }
);

const revolutDetailsSchema = new Schema(
  {
    fullName: { type: String, required: true },
    iban: { type: String, required: true },
    bic: { type: String, required: true },
    tag: { type: String, required: false }
  },
  {
    _id: false,
    strict: 'throw'
  }
);

const bankDetailsSchema = new Schema(
  {
    accountName: { type: String, required: true },
    sortCode: { type: String, required: true },
    accountNumber: { type: String, required: true },
    bankName: { type: String, required: true },
    iban: { type: String, required: true },
    bicSwift: { type: String, required: true }
  },
  {
    _id: false,
    strict: 'throw'
  }
);

const userPaymentDetailsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
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
  },
  {
    strict: 'throw',
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: true }
  }
);

export type UserPaymentDetailsDocument = InferSchemaType<typeof userPaymentDetailsSchema> & {
  _id: string;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const UserPaymentDetailsModel = model('UserPaymentDetails', userPaymentDetailsSchema);
