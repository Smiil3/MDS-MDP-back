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

    const authUser = req.authUser!;
    const isDriver = authUser.role === "driver" && booking.driver.id_driver === parseInt(authUser.sub);
    const isMechanic = authUser.role === "mechanic" && booking.mechanic.id_mechanic === parseInt(authUser.sub);

    if (!isDriver && !isMechanic) {
      res.status(403).json({ message: "Access denied." });
      return;
    }

    res.status(200).json(booking);
  },

  async getMyBookings(req: Request, res: Response) {
    const driverId = parseInt(req.authUser!.sub);
    const bookings = await bookingService.findByDriverId(driverId);
    res.status(200).json({ bookings });
  },

  async create(req: Request, res: Response) {
    const { errors, value } = validatePayload(createBookingSchema, req.body);

    if (errors || !value) {
      res.status(400).json({ message: "Invalid payload.", errors });
      return;
    }

    const id_driver = parseInt(req.authUser!.sub);
    const booking = await bookingService.create({ ...value, id_driver });
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

    if (existing.driver.id_driver !== parseInt(req.authUser!.sub)) {
      res.status(403).json({ message: "Access denied." });
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

    if (existing.driver.id_driver !== parseInt(req.authUser!.sub)) {
      res.status(403).json({ message: "Access denied." });
      return;
    }

    await bookingService.delete(value.id);
    res.status(204).send();
  },
};
