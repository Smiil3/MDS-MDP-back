import { type Request, type Response } from "express";
import { bookingStatusService } from "../services/bookingStatus.service";

export const bookingStatusController = {
  async getAll(_req: Request, res: Response) {
    const statuses = await bookingStatusService.findAll();
    res.status(200).json({ statuses });
  },
};
