import { type Request, type Response } from "express";
import { garageService } from "../services/garage.service";
import {
  validateGarageIdParam,
  validateGarageSlotsQuery,
  validateNearbyGaragesQuery,
} from "../validators/garage.validator";

export const garageController = {
  async getNearbyGarages(req: Request, res: Response) {
    const { errors, value } = validateNearbyGaragesQuery(req.query);

    if (errors || !value) {
      res.status(400).json({ message: "Invalid query params.", errors });
      return;
    }

    const garages = await garageService.findNearby(value);
    res.status(200).json({ garages });
  },

  async getGarageById(req: Request, res: Response) {
    const { errors, value } = validateGarageIdParam(req.params);

    if (errors || !value) {
      res.status(400).json({ message: "Invalid garage id.", errors });
      return;
    }

    const garage = await garageService.findById(value.id);
    if (!garage) {
      res.status(404).json({ message: "Garage not found." });
      return;
    }

    res.status(200).json({ garage });
  },

  async getBookedSlots(req: Request, res: Response) {
    const { errors: paramErrors, value: paramValue } = validateGarageIdParam(req.params);

    if (paramErrors || !paramValue) {
      res.status(400).json({ message: "Invalid garage id.", errors: paramErrors });
      return;
    }

    const { errors: queryErrors, value: queryValue } = validateGarageSlotsQuery(req.query);

    if (queryErrors || !queryValue) {
      res.status(400).json({ message: "Invalid query params.", errors: queryErrors });
      return;
    }

    const bookedSlots = await garageService.findBookedSlots(paramValue.id, queryValue.date);
    res.status(200).json({ bookedSlots });
  },
};
