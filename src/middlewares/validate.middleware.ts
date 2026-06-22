import { type NextFunction, type Request, type Response } from "express";
import type { ObjectSchema } from "joi";
import { validatePayload } from "../validators/validator.utils";

export const validateBody = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = validatePayload(schema, req.body);

    if (result.errors) {
      res.status(400).json({ message: "Invalid payload.", errors: result.errors });
      return;
    }

    next();
  };
};
