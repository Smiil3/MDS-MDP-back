import { Router } from "express";
import { bookingStatusController } from "../controllers/bookingStatus.controller";

export const bookingStatusRouter = Router();

bookingStatusRouter.get("/", bookingStatusController.getAll);
