import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const userRouter = Router();

userRouter.get("/", userController.getUsers);
userRouter.post("/", userController.createUser);
userRouter.get("/me", authMiddleware(["driver"]), userController.getCurrentDriverProfile);
userRouter.patch(
  "/me",
  authMiddleware(["driver"]),
  userController.updateCurrentDriverProfile,
);
userRouter.get(
  "/me/vehicles",
  authMiddleware(["driver"]),
  userController.getCurrentDriverVehicles,
);
userRouter.post(
  "/me/vehicles",
  authMiddleware(["driver"]),
  userController.createCurrentDriverVehicle,
);
