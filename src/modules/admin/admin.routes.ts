import { Router } from "express";
import { Role } from "../../common/constants/roles";
import { authGuard } from "../../common/guards/auth.guard";
import { rolesGuard } from "../../common/guards/roles.guard";
import { uploadSongFilesMiddleware } from "../../common/middleware/upload.middleware";
import { validateRequest } from "../../common/middleware/validate.middleware";
import { asyncHandler } from "../../common/utils/async-handler";
import { platformRouter } from "../platform/platform.routes";
import { songsController } from "../songs/songs.controller";
import { withdrawalAdminController } from "../withdrawal/withdrawal.admin.controller";
import {
  createSongBodySchema,
  songIdParamsSchema,
  updateSongSchema,
} from "../songs/songs.validation";
import {
  coinNetworkPathParamsSchema,
  coinPathParamsSchema,
  createCoinSchema,
  createNetworkSchema,
  updateCoinSchema,
  updateNetworkSchema,
  updateWithdrawalMethodsSchema,
  withdrawalIdParamsSchema,
} from "../withdrawal/withdrawal.validation";

export const adminRouter = Router();

adminRouter.use(authGuard, rolesGuard([Role.ADMIN]));
adminRouter.post(
  "/songs",
  uploadSongFilesMiddleware,
  validateRequest({ body: createSongBodySchema }),
  asyncHandler(songsController.createSong.bind(songsController)),
);
adminRouter.patch(
  "/songs/:id",
  validateRequest({ params: songIdParamsSchema, body: updateSongSchema }),
  asyncHandler(songsController.updateSong.bind(songsController)),
);
adminRouter.delete(
  "/songs/:id",
  validateRequest({ params: songIdParamsSchema }),
  asyncHandler(songsController.deleteSong.bind(songsController)),
);
adminRouter.patch(
  "/settings/methods",
  validateRequest({ body: updateWithdrawalMethodsSchema }),
  asyncHandler(
    withdrawalAdminController.updateMethodSettings.bind(
      withdrawalAdminController,
    ),
  ),
);
adminRouter.post(
  "/crypto/coins",
  validateRequest({ body: createCoinSchema }),
  asyncHandler(
    withdrawalAdminController.createCoin.bind(withdrawalAdminController),
  ),
);
adminRouter.patch(
  "/crypto/coins/:coin",
  validateRequest({ params: coinPathParamsSchema, body: updateCoinSchema }),
  asyncHandler(
    withdrawalAdminController.updateCoin.bind(withdrawalAdminController),
  ),
);
adminRouter.post(
  "/crypto/coins/:coin/networks",
  validateRequest({ params: coinPathParamsSchema, body: createNetworkSchema }),
  asyncHandler(
    withdrawalAdminController.addNetwork.bind(withdrawalAdminController),
  ),
);
adminRouter.patch(
  "/crypto/coins/:coin/networks/:network",
  validateRequest({
    params: coinNetworkPathParamsSchema,
    body: updateNetworkSchema,
  }),
  asyncHandler(
    withdrawalAdminController.updateNetwork.bind(withdrawalAdminController),
  ),
);
adminRouter.get(
  "/withdrawals",
  asyncHandler(
    withdrawalAdminController.listWithdrawals.bind(withdrawalAdminController),
  ),
);
adminRouter.get(
  "/withdrawals/:id",
  validateRequest({ params: withdrawalIdParamsSchema }),
  asyncHandler(
    withdrawalAdminController.getWithdrawalById.bind(withdrawalAdminController),
  ),
);
adminRouter.patch(
  "/withdrawals/:id/approve",
  validateRequest({ params: withdrawalIdParamsSchema }),
  asyncHandler(
    withdrawalAdminController.approveWithdrawal.bind(withdrawalAdminController),
  ),
);
adminRouter.patch(
  "/withdrawals/:id/reject",
  validateRequest({ params: withdrawalIdParamsSchema }),
  asyncHandler(
    withdrawalAdminController.rejectWithdrawal.bind(withdrawalAdminController),
  ),
);
adminRouter.use("/platform", platformRouter);
