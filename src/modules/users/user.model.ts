import { InferSchemaType, model, Schema } from 'mongoose';
import { Role, roleValues } from '../../common/constants/roles';

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: roleValues,
      required: true,
      default: Role.USER
    }
  },
  {
    strict: 'throw',
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: string;
  createdAt: Date;
};

export const UserModel = model('User', userSchema);
