import { type Request, type Response } from "express";
import { userService, EmailAlreadyInUseError } from "../services/user.service";
import {
  createUserSchema,
  createVehicleSchema,
  updateDriverProfileSchema,
  type CreateUserInput,
  type CreateVehicleInput,
  type UpdateDriverProfileInput,
} from "../validators/user.validator";
import { validatePayload } from "../validators/validator.utils";

export class UserController {
  getUsers = async (_req: Request, res: Response) => {
    const users = await userService.findAll();
    res.status(200).json(users);
  };

  createUser = async (req: Request, res: Response) => {
    const { errors, value } = validatePayload<CreateUserInput>(createUserSchema, req.body);
    if (errors || !value) {
      res.status(400).json({ message: "Invalid payload.", errors });
      return;
    }
    const user = await userService.create(value);
    res.status(201).json(user);
  };

  getCurrentDriverProfile = async (req: Request, res: Response) => {
    const userId = Number.parseInt(req.authUser?.sub ?? "", 10);
    if (Number.isNaN(userId)) {
      res.status(401).json({ message: "Invalid authenticated user." });
      return;
    }
    const profile = await userService.findProfileById(userId);
    if (!profile) {
      res.status(404).json({ message: "Driver profile not found." });
      return;
    }
    res.status(200).json({ profile });
  };

  updateCurrentDriverProfile = async (req: Request, res: Response) => {
    const { errors, value } = validatePayload<UpdateDriverProfileInput>(
      updateDriverProfileSchema,
      req.body,
      { stripUnknown: true },
    );
    if (errors || !value) {
      res.status(400).json({ message: "Invalid payload.", errors });
      return;
    }
    const userId = Number.parseInt(req.authUser?.sub ?? "", 10);
    if (Number.isNaN(userId)) {
      res.status(401).json({ message: "Invalid authenticated user." });
      return;
    }
    try {
      const profile = await userService.updateProfileById(userId, value);
      res.status(200).json({ profile });
    } catch (error) {
      if (error instanceof EmailAlreadyInUseError) {
        res.status(409).json({ message: error.message });
        return;
      }
      throw error;
    }
  };

  getCurrentDriverVehicles = async (req: Request, res: Response) => {
    const userId = Number.parseInt(req.authUser?.sub ?? "", 10);
    if (Number.isNaN(userId)) {
      res.status(401).json({ message: "Invalid authenticated user." });
      return;
    }
    const vehicles = await userService.listVehiclesByDriverId(userId);
    res.status(200).json({ vehicles });
  };

  createCurrentDriverVehicle = async (req: Request, res: Response) => {
    const { errors, value } = validatePayload<CreateVehicleInput>(
      createVehicleSchema,
      req.body,
      { stripUnknown: true },
    );
    if (errors || !value) {
      res.status(400).json({ message: "Invalid payload.", errors });
      return;
    }
    const userId = Number.parseInt(req.authUser?.sub ?? "", 10);
    if (Number.isNaN(userId)) {
      res.status(401).json({ message: "Invalid authenticated user." });
      return;
    }
    const vehicle = await userService.createVehicleForDriver(userId, value);
    res.status(201).json({ vehicle });
  };
}

export const userController = new UserController();
