import {Router} from "express";
import {userController} from "../controllers/user.controller";
import {authMiddleware} from "../middlewares/auth.middleware";
import {AuthRole} from "../types/auth";

export const userRouter = Router();

userRouter.get("/", userController.getUsers);
userRouter.post("/", userController.createUser);
userRouter.get("/me", authMiddleware([AuthRole.DRIVER]), userController.getCurrentDriverProfile);
userRouter.patch(
  "/me",
  authMiddleware([AuthRole.DRIVER]),
  userController.updateCurrentDriverProfile,
);
userRouter.get(
  "/me/vehicles",
  authMiddleware([AuthRole.DRIVER]),
  userController.getCurrentDriverVehicles,
);
userRouter.post(
  "/me/vehicles",
  authMiddleware([AuthRole.DRIVER]),
  userController.createCurrentDriverVehicle,
);
