import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const authRouter = Router();

authRouter.post("/drivers/register", authController.registerDriver);
authRouter.post("/drivers/login", authController.loginDriver);
authRouter.get(
  "/drivers/me",
  authMiddleware(["driver"]),
  authController.getDriverProfile,
);

authRouter.post("/mechanics/register", authController.registerMechanic);
authRouter.post("/mechanics/login", authController.loginMechanic);
authRouter.get(
  "/mechanics/me",
  authMiddleware(["mechanic"]),
  authController.getMechanicProfile,
);
