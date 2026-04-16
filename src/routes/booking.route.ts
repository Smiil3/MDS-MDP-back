import { Router } from "express";
import { bookingController } from "../controllers/booking.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const bookingRouter = Router();

bookingRouter.get("/me", authMiddleware(["driver"]), bookingController.getMyBookings);
bookingRouter.get("/:id", authMiddleware(["driver", "mechanic"]), bookingController.getById);
bookingRouter.post("/", authMiddleware(["driver"]), bookingController.create);
bookingRouter.put("/:id", authMiddleware(["driver"]), bookingController.update);
bookingRouter.delete("/:id", authMiddleware(["driver"]), bookingController.remove);
