import { type Request, type Response } from "express";
import { bookingService } from "../services/booking.service";
import {
  bookingIdParamSchema,
  createBookingSchema,
  updateBookingSchema,
} from "../validators/booking.validator";
import { validatePayload } from "../validators/validator.utils";

type IdParam = { id: string };

export const bookingController = {
  async getById(req: Request<IdParam>, res: Response) {
    const { errors, value } = validatePayload(bookingIdParamSchema, req.params);

    if (errors || !value) {
      res.status(400).json({ message: "Invalid booking id." });
      return;
    }

    const booking = await bookingService.findById(value.id);
    if (!booking) {
      res.status(404).json({ message: "Booking not found." });
      return;
    }

    res.status(200).json(booking);
  },

  async create(req: Request, res: Response) {
    const { errors, value } = validatePayload(createBookingSchema, req.body);

    if (errors || !value) {
      res.status(400).json({ message: "Invalid payload.", errors });
      return;
    }

    const booking = await bookingService.create(value);
    res.status(201).json(booking);
  },

  async update(req: Request<IdParam>, res: Response) {
    const { errors: paramErrors, value: params } = validatePayload(
      bookingIdParamSchema,
      req.params,
    );

    if (paramErrors || !params) {
      res.status(400).json({ message: "Invalid booking id." });
      return;
    }

    const existing = await bookingService.findById(params.id);
    if (!existing) {
      res.status(404).json({ message: "Booking not found." });
      return;
    }

    const { errors, value } = validatePayload(updateBookingSchema, req.body);

    if (errors || !value) {
      res.status(400).json({ message: "Invalid payload.", errors });
      return;
    }

    if (Object.keys(value).length === 0) {
      res.status(400).json({ message: "No valid fields provided for update." });
      return;
    }

    const booking = await bookingService.update(params.id, value);
    res.status(200).json(booking);
  },

  async remove(req: Request<IdParam>, res: Response) {
    const { errors, value } = validatePayload(bookingIdParamSchema, req.params);

    if (errors || !value) {
      res.status(400).json({ message: "Invalid booking id." });
      return;
    }

    const existing = await bookingService.findById(value.id);
    if (!existing) {
      res.status(404).json({ message: "Booking not found." });
      return;
    }

    await bookingService.delete(value.id);
    res.status(204).send();
  },
};
