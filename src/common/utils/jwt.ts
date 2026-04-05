import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import type { Role } from "../constants/roles";

export type AuthTokenPayload = {
  sub: string;
  email: string;
  role: Role;
};

export const signAuthToken = (payload: AuthTokenPayload) => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  });
};

export const verifyAuthToken = (token: string) => {
  return jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
};
