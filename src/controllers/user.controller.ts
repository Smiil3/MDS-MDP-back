import { type Request, type Response } from "express";
import { userService } from "../services/user.service";
import { createUserSchema } from "../validators/user.validator";
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
};
