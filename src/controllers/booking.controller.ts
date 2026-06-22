import { type Request, type Response } from "express";
import { bookingService } from "../services/booking.service";
import {
  bookingIdParamSchema,
  createBookingSchema,
  updateBookingSchema,
  type BookingIdParamInput,
  type CreateBookingInput,
  type UpdateBookingInput,
} from "../validators/booking.validator";
import { validatePayload } from "../validators/validator.utils";
import { AuthRole } from "../types/auth";

type IdParam = { id: string };

export class BookingController {
  getById = async (req: Request<IdParam>, res: Response) => {
    const { errors, value } = validatePayload<BookingIdParamInput>(bookingIdParamSchema, req.params);
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
    const isDriver = authUser.role === AuthRole.DRIVER && booking.driver.id_driver === parseInt(authUser.sub);
    const isMechanic = authUser.role === AuthRole.MECHANIC && booking.mechanic.id_mechanic === parseInt(authUser.sub);
    if (!isDriver && !isMechanic) {
      res.status(403).json({ message: "Access denied." });
      return;
    }
    res.status(200).json(booking);
  };

  getMyBookings = async (req: Request, res: Response) => {
    const driverId = parseInt(req.authUser!.sub);
    const bookings = await bookingService.findByDriverId(driverId);
    res.status(200).json({ bookings });
  };

  create = async (req: Request, res: Response) => {
    const { errors, value } = validatePayload<CreateBookingInput>(createBookingSchema, req.body);
    if (errors || !value) {
      res.status(400).json({ message: "Invalid payload.", errors });
      return;
    }
    const id_driver = parseInt(req.authUser!.sub);
    const booking = await bookingService.create({ ...value, id_driver });
    res.status(201).json({ booking });
  };

  update = async (req: Request<IdParam>, res: Response) => {
    const { errors: paramErrors, value: params } = validatePayload<BookingIdParamInput>(
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
    const { errors, value } = validatePayload<UpdateBookingInput>(updateBookingSchema, req.body);
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
  };

  remove = async (req: Request<IdParam>, res: Response) => {
    const { errors, value } = validatePayload<BookingIdParamInput>(bookingIdParamSchema, req.params);
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
  };
}

export const bookingController = new BookingController();
