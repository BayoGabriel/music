import { NextFunction, Request, Response } from 'express';
import { verifyAuthToken } from '../utils/jwt';
import { AppError } from '../errors/app-error';

export const authGuard = (req: Request, _res: Response, next: NextFunction) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader?.startsWith('Bearer ')) {
    next(new AppError(401, 'Authorization token is required'));
    return;
  }

  const token = authorizationHeader.slice('Bearer '.length).trim();

  try {
    const payload = verifyAuthToken(token);

    req.authUser = {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };

    next();
  } catch (_error) {
    next(new AppError(401, 'Invalid or expired token'));
  }
};
