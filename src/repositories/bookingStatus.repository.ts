import { prisma } from "../prisma/client";

export class BookingStatusRepository {
  findAll() {
    return prisma.booking_status.findMany({
      select: { id_booking_status: true, label: true },
      orderBy: { id_booking_status: "asc" },
    });
  }
}

export const bookingStatusRepository = new BookingStatusRepository();
