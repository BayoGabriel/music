import { Request, Response } from 'express';
import { withdrawalService } from './withdrawal.service';

class WithdrawalController {
  public async getAvailableMethods(_req: Request, res: Response) {
    const data = await withdrawalService.getAvailableMethods();
    res.status(200).json({ data });
  }

  public async createWithdrawal(req: Request, res: Response) {
    const data = await withdrawalService.createWithdrawal(req.authUser?.id as string, req.body);
    res.status(201).json({ data });
  }
}

export const withdrawalController = new WithdrawalController();
