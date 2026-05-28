import { type Request, type Response } from "express";
import { authService, MissingSubscriptionError } from "../services/auth.service";
import { GeocodingError } from "../services/geocoding.service";
import type {
  DriverLoginInput,
  DriverRegisterInput,
  MechanicLoginInput,
  MechanicRegisterInput,
  RefreshTokenInput,
} from "../validators/auth.validator";

export class AuthController {
  registerDriver = async (req: Request, res: Response) => {
    const value = req.body as DriverRegisterInput;

    let result;
    try {
      result = await authService.registerDriver(value);
    } catch (error) {
      if (error instanceof MissingSubscriptionError) {
        res.status(400).json({ message: error.message });
        return;
      }

      throw error;
    }

    if (!result) {
      res.status(409).json({ message: "Driver account already exists." });
      return;
    }

    res.status(201).json(result);
  };

  loginDriver = async (req: Request, res: Response) => {
    const value = req.body as DriverLoginInput;

    const result = await authService.loginDriver(value);

    if (!result) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    res.status(200).json(result);
  };

  registerMechanic = async (req: Request, res: Response) => {
    const value = req.body as MechanicRegisterInput;

    let result;
    try {
      result = await authService.registerMechanic(value);
    } catch (error) {
      if (error instanceof GeocodingError) {
        res.status(400).json({ message: error.message });
        return;
      }

      throw error;
    }

    if (!result) {
      res.status(409).json({ message: "Mechanic account already exists." });
      return;
    }

    res.status(201).json(result);
  };

  loginMechanic = async (req: Request, res: Response) => {
    const value = req.body as MechanicLoginInput;

    const result = await authService.loginMechanic(value);

    if (!result) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    res.status(200).json(result);
  };

  refresh = async (req: Request, res: Response) => {
    const value = req.body as RefreshTokenInput;

    const result = await authService.refreshToken(value.refreshToken);

    if (!result) {
      res.status(401).json({ message: "Invalid or expired refresh token." });
      return;
    }

    res.status(200).json(result);
  };
}

export const authController = new AuthController();
