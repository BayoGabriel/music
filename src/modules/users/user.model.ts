import type { Role } from "../../common/constants/roles";

export type UserDocument = {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
};
