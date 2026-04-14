import { Router } from "express";
import { userController } from "../controllers/user.controller";

export const userRouter = Router();

userRouter.get("/", userController.getUsers);
userRouter.post("/", userController.createUser);
