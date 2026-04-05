import { Request, Response } from 'express';
import { authService } from './auth.service';

class AuthController {
  public async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    res.status(201).json({ data: result });
  }

  public async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    res.status(200).json({ data: result });
  }
}

export const authController = new AuthController();
