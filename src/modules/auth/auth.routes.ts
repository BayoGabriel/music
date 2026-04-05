import { Router } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { validateRequest } from "../../common/middleware/validate.middleware";
import { authController } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validation";

export const authRouter = Router();

authRouter.post(
  "/register",
  validateRequest({ body: registerSchema }),
  asyncHandler(authController.register.bind(authController)),
);
authRouter.post(
  "/login",
  validateRequest({ body: loginSchema }),
  asyncHandler(authController.login.bind(authController)),
);
