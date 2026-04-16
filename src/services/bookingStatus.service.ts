import { prisma } from "../prisma/client";

export type BookingStatusDto = {
  id: number;
  label: string;
};

export const bookingStatusService = {
  async findAll(): Promise<BookingStatusDto[]> {
    const statuses = await prisma.booking_status.findMany({
      select: {
        id_booking_status: true,
        label: true,
      },
      orderBy: {
        id_booking_status: "asc",
      },
    });

    return statuses.map((status) => ({
      id: status.id_booking_status,
      label: status.label,
    }));
  },
};
