import { Router } from "express";
import { locationController } from "../controllers/location.controller";

export const locationRouter = Router();

locationRouter.get("/address-suggestions", locationController.getAddressSuggestions);
locationRouter.get("/cities", locationController.getCitiesByPostalCode);
locationRouter.get("/siret/:siret", locationController.getGarageBySiret);
