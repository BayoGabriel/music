import { NextFunction, Request, Response } from "express";
import type { Role } from "../constants/roles";
import { AppError } from "../errors/app-error";

export const rolesGuard = (allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.authUser) {
      next(new AppError(401, "Authentication required"));
      return;
    }

    if (!allowedRoles.includes(req.authUser.role)) {
      next(new AppError(403, "Insufficient permissions"));
      return;
    }

    next();
  };
};
