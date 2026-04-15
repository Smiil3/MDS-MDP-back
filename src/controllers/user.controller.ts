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
    const {
      last_name,
      first_name,
      email,
      password,
      phone,
      birth_date,
      id_subscription,
    } = req.body as {
      last_name?: unknown;
      first_name?: unknown;
      email?: unknown;
      password?: unknown;
      phone?: unknown;
      birth_date?: unknown;
      id_subscription?: unknown;
    };

    if (
      !isNonEmptyString(last_name) ||
      !isNonEmptyString(first_name) ||
      !isNonEmptyString(email) ||
      !isNonEmptyString(password) ||
      !isNonEmptyString(phone) ||
      !isNonEmptyString(birth_date) ||
      typeof id_subscription !== "number"
    ) {
      res.status(400).json({
        message:
          "Fields 'last_name', 'first_name', 'email', 'password', 'phone', 'birth_date' and numeric 'id_subscription' are required.",
      });
      return;
    }

    const user = await userService.create({
      last_name: last_name.trim(),
      first_name: first_name.trim(),
      email: email.trim(),
      password: password.trim(),
      phone: phone.trim(),
      birth_date: birth_date.trim(),
      id_subscription,
    });

    res.status(201).json(user);
  },
};
