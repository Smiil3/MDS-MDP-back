import { type Request, type Response } from "express";
import { authService } from "../services/auth.service";
import {
  driverLoginSchema,
  driverRegisterSchema,
  mechanicLoginSchema,
  mechanicRegisterSchema,
  validatePayload,
} from "../validators/auth.validator";

export const authController = {
  async registerDriver(req: Request, res: Response) {
    const { errors, value } = validatePayload(driverRegisterSchema, req.body);

    if (errors || !value) {
      res.status(400).json({ message: "Invalid payload.", errors });
      return;
    }

    const result = await authService.registerDriver(value);

    if (!result) {
      res.status(409).json({ message: "Driver account already exists." });
      return;
    }

    res.status(201).json(result);
  },

  async loginDriver(req: Request, res: Response) {
    const { errors, value } = validatePayload(driverLoginSchema, req.body);

    if (errors || !value) {
      res.status(400).json({ message: "Invalid payload.", errors });
      return;
    }

    const result = await authService.loginDriver(value);

    if (!result) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    res.status(200).json(result);
  },

  async registerMechanic(req: Request, res: Response) {
    const { errors, value } = validatePayload(mechanicRegisterSchema, req.body);

    if (errors || !value) {
      res.status(400).json({ message: "Invalid payload.", errors });
      return;
    }

    const result = await authService.registerMechanic(value);

    if (!result) {
      res.status(409).json({ message: "Mechanic account already exists." });
      return;
    }

    res.status(201).json(result);
  },

  async loginMechanic(req: Request, res: Response) {
    const { errors, value } = validatePayload(mechanicLoginSchema, req.body);

    if (errors || !value) {
      res.status(400).json({ message: "Invalid payload.", errors });
      return;
    }

    const result = await authService.loginMechanic(value);

    if (!result) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    res.status(200).json(result);
  },

  getDriverProfile(req: Request, res: Response) {
    res.status(200).json({ user: req.authUser });
  },

  getMechanicProfile(req: Request, res: Response) {
    res.status(200).json({ user: req.authUser });
  },
};
