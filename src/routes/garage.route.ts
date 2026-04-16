import { Router } from "express";
import { garageController } from "../controllers/garage.controller";

export const garageRouter = Router();

garageRouter.get("/nearby", garageController.getNearbyGarages);
garageRouter.get("/:id/slots", garageController.getBookedSlots);
garageRouter.get("/:id", garageController.getGarageById);
