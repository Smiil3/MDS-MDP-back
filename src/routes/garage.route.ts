import { Router } from "express";
import { garageController } from "../controllers/garage.controller";

export const garageRouter = Router();

garageRouter.get("/nearby", garageController.getNearbyGarages);
