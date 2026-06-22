import { Router } from "express";
import { bookingController } from "../controllers/booking.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import {AuthRole} from "../types/auth";

export const bookingRouter = Router();

bookingRouter.get("/me", authMiddleware([AuthRole.DRIVER]), bookingController.getMyBookings);
bookingRouter.get("/:id", authMiddleware([AuthRole.DRIVER, AuthRole.MECHANIC]), bookingController.getById);
bookingRouter.post("/", authMiddleware([AuthRole.DRIVER]), bookingController.create);
bookingRouter.put("/:id", authMiddleware([AuthRole.DRIVER]), bookingController.update);
bookingRouter.delete("/:id", authMiddleware([AuthRole.DRIVER]), bookingController.remove);
