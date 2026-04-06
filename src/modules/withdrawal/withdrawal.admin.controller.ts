import { Request, Response } from 'express';
import { withdrawalService } from './withdrawal.service';

class WithdrawalAdminController {
  public async updateMethodSettings(req: Request, res: Response) {
    const data = await withdrawalService.updateMethodSettings(req.body);
    res.status(200).json({ data });
  }

  public async createCoin(req: Request, res: Response) {
    const data = await withdrawalService.createCoin(req.body);
    res.status(201).json({ data });
  }

  public async updateCoin(req: Request, res: Response) {
    const data = await withdrawalService.updateCoin(req.params.coin, req.body);
    res.status(200).json({ data });
  }

  public async addNetwork(req: Request, res: Response) {
    const data = await withdrawalService.addNetwork(req.params.coin, req.body);
    res.status(201).json({ data });
  }

  public async updateNetwork(req: Request, res: Response) {
    const data = await withdrawalService.updateNetwork(req.params.coin, req.params.network, req.body);
    res.status(200).json({ data });
  }

  public async listWithdrawals(_req: Request, res: Response) {
    const data = await withdrawalService.listWithdrawals();
    res.status(200).json({ data });
  }

  public async getWithdrawalById(req: Request, res: Response) {
    const data = await withdrawalService.getWithdrawalById(req.params.id);
    res.status(200).json({ data });
  }

  public async approveWithdrawal(req: Request, res: Response) {
    const data = await withdrawalService.approveWithdrawal(req.params.id);
    res.status(200).json({ data });
  }

  public async rejectWithdrawal(req: Request, res: Response) {
    const data = await withdrawalService.rejectWithdrawal(req.params.id);
    res.status(200).json({ data });
  }
}

export const withdrawalAdminController = new WithdrawalAdminController();
