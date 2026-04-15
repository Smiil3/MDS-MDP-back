import { type Request, type Response } from "express";
import { mechanicService } from "../services/mechanic.service";
import {
  createMechanicSchema,
  mechanicIdParamSchema,
  updateMechanicSchema,
} from "../validators/mechanic.validator";
import { validatePayload } from "../validators/validator.utils";

type IdParam = { id: string };

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const mechanicController = {
  async getAll(_req: Request, res: Response) {
    const mechanics = await mechanicService.findAll();
    res.status(200).json(mechanics);
  },

  async getById(req: Request<IdParam>, res: Response) {
    const { errors, value } = validatePayload(mechanicIdParamSchema, req.params);

    if (errors || !value) {
      res.status(400).json({ message: "Invalid mechanic id." });
      return;
    }

    const mechanic = await mechanicService.findById(value.id);
    if (!mechanic) {
      res.status(404).json({ message: "Mechanic not found." });
      return;
    }

    res.status(200).json(mechanic);
  },

  async create(req: Request, res: Response) {
    const { errors, value } = validatePayload(createMechanicSchema, req.body);

    if (errors || !value) {
      res.status(400).json({ message: "Invalid payload.", errors });
      return;
    }

    const mechanic = await mechanicService.create(value);

    res.status(201).json(mechanic);
  },

  async update(req: Request<IdParam>, res: Response) {
    const { errors: paramErrors, value: params } = validatePayload(
      mechanicIdParamSchema,
      req.params,
    );

    if (paramErrors || !params) {
      res.status(400).json({ message: "Invalid mechanic id." });
      return;
    }

    const existing = await mechanicService.findById(params.id);
    if (!existing) {
      res.status(404).json({ message: "Mechanic not found." });
      return;
    }

    const { errors, value } = validatePayload(updateMechanicSchema, req.body);

    if (errors || !value) {
      res.status(400).json({ message: "Invalid payload.", errors });
      return;
    }

    const data: Record<string, unknown> = {};
    if (isNonEmptyString(value.name)) data.name = value.name.trim();
    if (isNonEmptyString(value.email)) data.email = value.email.trim();
    if (isNonEmptyString(value.password)) data.password = value.password.trim();
    if (isNonEmptyString(value.address)) data.address = value.address.trim();
    if (typeof value.zip_code === "number") data.zip_code = value.zip_code;
    if (isNonEmptyString(value.city)) data.city = value.city.trim();
    if (isNonEmptyString(value.siret)) data.siret = value.siret.trim();
    if (isNonEmptyString(value.description)) data.description = value.description.trim();

    if (Object.keys(data).length === 0) {
      res.status(400).json({ message: "No valid fields provided for update." });
      return;
    }

    const mechanic = await mechanicService.update(params.id, data);
    res.status(200).json(mechanic);
  },

  async remove(req: Request<IdParam>, res: Response) {
    const { errors, value } = validatePayload(mechanicIdParamSchema, req.params);

    if (errors || !value) {
      res.status(400).json({ message: "Invalid mechanic id." });
      return;
    }

    const existing = await mechanicService.findById(value.id);
    if (!existing) {
      res.status(404).json({ message: "Mechanic not found." });
      return;
    }

    await mechanicService.delete(value.id);
    res.status(204).send();
  },

  async getBookings(req: Request<IdParam>, res: Response) {
    const { errors, value } = validatePayload(mechanicIdParamSchema, req.params);

    if (errors || !value) {
      res.status(400).json({ message: "Invalid mechanic id." });
      return;
    }

    const existing = await mechanicService.findById(value.id);
    if (!existing) {
      res.status(404).json({ message: "Mechanic not found." });
      return;
    }

    const bookings = await mechanicService.findBookings(value.id);
    res.status(200).json(bookings);
  },

  async getServices(req: Request<IdParam>, res: Response) {
    const { errors, value } = validatePayload(mechanicIdParamSchema, req.params);

    if (errors || !value) {
      res.status(400).json({ message: "Invalid mechanic id." });
      return;
    }

    const existing = await mechanicService.findById(value.id);
    if (!existing) {
      res.status(404).json({ message: "Mechanic not found." });
      return;
    }

    const services = await mechanicService.findServices(value.id);
    res.status(200).json(services);
  },

  async getReviews(req: Request<IdParam>, res: Response) {
    const { errors, value } = validatePayload(mechanicIdParamSchema, req.params);

    if (errors || !value) {
      res.status(400).json({ message: "Invalid mechanic id." });
      return;
    }

    const existing = await mechanicService.findById(value.id);
    if (!existing) {
      res.status(404).json({ message: "Mechanic not found." });
      return;
    }

    const reviews = await mechanicService.findReviews(value.id);
    res.status(200).json(reviews);
  },
};
