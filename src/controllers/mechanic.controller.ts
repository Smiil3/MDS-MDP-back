import { type Request, type Response } from "express";
import { mechanicService, NoValidFieldsError } from "../services/mechanic.service";
import {
  createMechanicSchema,
  mechanicIdParamSchema,
  updateMechanicSchema,
  type MechanicIdParamInput,
  type CreateMechanicInput,
  type UpdateMechanicInput,
} from "../validators/mechanic.validator";
import { validatePayload } from "../validators/validator.utils";

type IdParam = { id: string };

export class MechanicController {
  getAll = async (_req: Request, res: Response) => {
    const mechanics = await mechanicService.findAll();
    res.status(200).json(mechanics);
  };

  getById = async (req: Request<IdParam>, res: Response) => {
    const { errors, value } = validatePayload<MechanicIdParamInput>(mechanicIdParamSchema, req.params);
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
  };

  create = async (req: Request, res: Response) => {
    const { errors, value } = validatePayload<CreateMechanicInput>(createMechanicSchema, req.body);
    if (errors || !value) {
      res.status(400).json({ message: "Invalid payload.", errors });
      return;
    }
    const mechanic = await mechanicService.create(value);
    res.status(201).json(mechanic);
  };

  update = async (req: Request<IdParam>, res: Response) => {
    const { errors: paramErrors, value: params } = validatePayload<MechanicIdParamInput>(
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
    const { errors, value } = validatePayload<UpdateMechanicInput>(updateMechanicSchema, req.body);
    if (errors || !value) {
      res.status(400).json({ message: "Invalid payload.", errors });
      return;
    }
    try {
      const mechanic = await mechanicService.update(params.id, value);
      res.status(200).json(mechanic);
    } catch (error) {
      if (error instanceof NoValidFieldsError) {
        res.status(400).json({ message: error.message });
        return;
      }
      throw error;
    }
  };

  remove = async (req: Request<IdParam>, res: Response) => {
    const { errors, value } = validatePayload<MechanicIdParamInput>(mechanicIdParamSchema, req.params);
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
  };

  getBookings = async (req: Request<IdParam>, res: Response) => {
    const { errors, value } = validatePayload<MechanicIdParamInput>(mechanicIdParamSchema, req.params);
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
  };

  getServices = async (req: Request<IdParam>, res: Response) => {
    const { errors, value } = validatePayload<MechanicIdParamInput>(mechanicIdParamSchema, req.params);
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
  };

  getReviews = async (req: Request<IdParam>, res: Response) => {
    const { errors, value } = validatePayload<MechanicIdParamInput>(mechanicIdParamSchema, req.params);
    if (errors || !value) {
      res.status(400).json({ message: "Invalid mechanic id." });
      return;
    }
    const existing = await mechanicService.findById(value.id);
    if (!existing) {
      res.status(404).json({ message: "Mechanic not found." });
      return;
    }
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 5);
    const skip = (page - 1) * limit;
    const { reviews, total, average } = await mechanicService.findReviews(value.id, skip, limit);
    const totalPages = Math.ceil(total / limit);
    res.status(200).json({ reviews, total, average, page, totalPages });
  };
}

export const mechanicController = new MechanicController();
