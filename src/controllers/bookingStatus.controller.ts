import { type Request, type Response } from "express";
import { bookingStatusService } from "../services/bookingStatus.service";

export class BookingStatusController {
  getAll = async (_req: Request, res: Response) => {
    const statuses = await bookingStatusService.findAll();
    res.status(200).json({ statuses });
  };
}

export const bookingStatusController = new BookingStatusController();
