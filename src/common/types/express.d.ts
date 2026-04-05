import type { Role } from "../constants/roles";

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string;
        email: string;
        role: Role;
      };
    }
  }
}

export {};
