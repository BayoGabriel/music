import bcrypt from "bcryptjs";
import { env } from "../../config/env";

export const hashPassword = async (password: string) =>
  bcrypt.hash(password, env.bcryptSaltRounds);

export const comparePassword = async (
  password: string,
  passwordHash: string,
) => {
  return bcrypt.compare(password, passwordHash);
};
