import { Router } from "express";
import { mechanicController } from "../controllers/mechanic.controller";

export const mechanicRouter = Router();

mechanicRouter.get("/", mechanicController.getAll);
mechanicRouter.get("/:id", mechanicController.getById);
mechanicRouter.post("/", mechanicController.create);
mechanicRouter.put("/:id", mechanicController.update);
mechanicRouter.delete("/:id", mechanicController.remove);

mechanicRouter.get("/:id/bookings", mechanicController.getBookings);
mechanicRouter.get("/:id/services", mechanicController.getServices);
mechanicRouter.get("/:id/reviews", mechanicController.getReviews);
