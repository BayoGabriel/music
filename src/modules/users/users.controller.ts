import { Request, Response } from 'express';
import { usersService } from './users.service';

class UsersController {
  public async getMe(req: Request, res: Response) {
    const userId = req.authUser?.id;
    const profile = await usersService.getProfile(userId as string);

    res.status(200).json({ data: profile });
  }
}

export const usersController = new UsersController();
