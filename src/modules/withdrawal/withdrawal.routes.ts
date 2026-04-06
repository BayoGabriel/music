import { Router } from 'express';
import { authGuard } from '../../common/guards/auth.guard';
import { validateRequest } from '../../common/middleware/validate.middleware';
import { asyncHandler } from '../../common/utils/async-handler';
import { withdrawalController } from './withdrawal.controller';
import { createWithdrawalSchema } from './withdrawal.validation';

export const withdrawalRouter = Router();

withdrawalRouter.use(authGuard);
withdrawalRouter.get('/methods', asyncHandler(withdrawalController.getAvailableMethods.bind(withdrawalController)));
withdrawalRouter.post('/', validateRequest({ body: createWithdrawalSchema }), asyncHandler(withdrawalController.createWithdrawal.bind(withdrawalController)));
