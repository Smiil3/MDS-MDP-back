import { type Request, type Response } from "express";
import {
  validateAddressSuggestionQuery,
  validateCitiesByPostalCodeQuery,
  validateSiretParam,
} from "../validators/location.validator";
import { LocationServiceError, locationService } from "../services/location.service";

export const locationController = {
  async getAddressSuggestions(req: Request, res: Response) {
    const { errors, value } = validateAddressSuggestionQuery(req.query);
    if (errors || !value) {
      res.status(400).json({ message: "Invalid query params.", errors });
      return;
    }

    try {
      const suggestions = await locationService.getAddressSuggestions(value.query);
      res.status(200).json({ suggestions });
    } catch (error) {
      if (error instanceof LocationServiceError) {
        res.status(502).json({ message: error.message });
        return;
      }
      throw error;
    }
  },

  async getCitiesByPostalCode(req: Request, res: Response) {
    const { errors, value } = validateCitiesByPostalCodeQuery(req.query);
    if (errors || !value) {
      res.status(400).json({ message: "Invalid query params.", errors });
      return;
    }

    try {
      const cities = await locationService.getCitiesByPostalCode(value.postalCode);
      res.status(200).json({ cities });
    } catch (error) {
      if (error instanceof LocationServiceError) {
        res.status(502).json({ message: error.message });
        return;
      }
      throw error;
    }
  },

  async getGarageBySiret(req: Request, res: Response) {
    const { errors, value } = validateSiretParam(req.params);
    if (errors || !value) {
      res.status(400).json({ message: "Invalid SIRET.", errors });
      return;
    }

    try {
      const result = await locationService.lookupGarageBySiret(value.siret);
      res.status(200).json({
        garage: {
          name: result.name,
          address: result.address,
          zipCode: result.zipCode,
          city: result.city,
        },
        source: result.source,
      });
    } catch (error) {
      if (error instanceof LocationServiceError) {
        res.status(404).json({ message: error.message });
        return;
      }
      throw error;
    }
  },
};
