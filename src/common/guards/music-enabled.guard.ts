import { NextFunction, Request, Response } from 'express';
import { platformService } from '../../modules/platform/platform.service';
import { AppError } from '../errors/app-error';

export const checkMusicEnabled = async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    const musicEnabled = await platformService.isMusicEnabled();

    if (!musicEnabled) {
      next(new AppError(403, 'Music streaming is currently disabled'));
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
