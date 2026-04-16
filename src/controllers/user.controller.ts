import { type Request, type Response } from "express";
import { Prisma } from "@prisma/client";
import { userService } from "../services/user.service";
import {
  createUserSchema,
  createVehicleSchema,
  updateDriverProfileSchema,
} from "../validators/user.validator";
import { validatePayload } from "../validators/validator.utils";

export const userController = {
  async getUsers(_req: Request, res: Response) {
    const users = await userService.findAll();
    res.status(200).json(users);
  },
  async createUser(req: Request, res: Response) {
    const { errors, value } = validatePayload(createUserSchema, req.body);

    if (errors || !value) {
      res.status(400).json({ message: "Invalid payload.", errors });
      return;
    }

    const user = await userService.create(value);

    res.status(201).json(user);
  },
  async getCurrentDriverProfile(req: Request, res: Response) {
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
  },
  async updateCurrentDriverProfile(req: Request, res: Response) {
    const { errors, value } = validatePayload(updateDriverProfileSchema, req.body, {
      stripUnknown: true,
    });

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
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        res.status(409).json({ message: "Email already in use." });
        return;
      }
      throw error;
    }
  },
  async getCurrentDriverVehicles(req: Request, res: Response) {
    const userId = Number.parseInt(req.authUser?.sub ?? "", 10);

    if (Number.isNaN(userId)) {
      res.status(401).json({ message: "Invalid authenticated user." });
      return;
    }

    const vehicles = await userService.listVehiclesByDriverId(userId);
    res.status(200).json({ vehicles });
  },
  async createCurrentDriverVehicle(req: Request, res: Response) {
    const { errors, value } = validatePayload(createVehicleSchema, req.body, {
      stripUnknown: true,
    });

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
  },
};
