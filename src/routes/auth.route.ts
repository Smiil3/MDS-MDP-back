import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validateBody } from "../middlewares/validate.middleware";
import {
  driverLoginSchema,
  driverRegisterSchema,
  mechanicLoginSchema,
  mechanicRegisterSchema,
  refreshTokenSchema,
} from "../validators/auth.validator";

export const authRouter = Router();

authRouter.post(
  "/drivers/register",
  validateBody(driverRegisterSchema),
  authController.registerDriver
);
authRouter.post(
  "/drivers/login",
  validateBody(driverLoginSchema),
  authController.loginDriver
);

authRouter.post(
  "/mechanics/register",
  validateBody(mechanicRegisterSchema),
  authController.registerMechanic
);
authRouter.post(
  "/mechanics/login",
  validateBody(mechanicLoginSchema),
  authController.loginMechanic
);

authRouter.post("/refresh", validateBody(refreshTokenSchema), authController.refresh);
