import { type Request, type Response } from "express";
import { userService } from "../services/user.service";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const userController = {
  async getUsers(_req: Request, res: Response) {
    const users = await userService.findAll();
    res.status(200).json(users);
  },
  async createUser(req: Request, res: Response) {
    const { email, name } = req.body as { email?: unknown; name?: unknown };

    if (!isNonEmptyString(email) || !isNonEmptyString(name)) {
      res.status(400).json({
        message: "Both 'email' and 'name' are required.",
      });
      return;
    }

    const user = await userService.create({
      email: email.trim(),
      name: name.trim(),
    });

    res.status(201).json(user);
  },
};
