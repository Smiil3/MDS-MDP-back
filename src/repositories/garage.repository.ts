import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";

const garageServiceSelect = {
  id_garage_service: true,
  category: true,
  label: true,
  price: true,
};

const garageServiceOrderBy = [
  { category: "asc" as const },
  { id_garage_service: "asc" as const },
];

export class GarageRepository {
  findManyWithServices(
    where: Prisma.mechanicWhereInput,
    orderBy: Prisma.mechanicOrderByWithRelationInput,
    take?: number,
  ) {
    return prisma.mechanic.findMany({
      where,
      orderBy,
      ...(take !== undefined && { take }),
      select: {
        id_mechanic: true,
        name: true,
        city: true,
        address: true,
        image_url: true,
        opening_hours: true,
        description: true,
        latitude: true,
        longitude: true,
        garage_service: { select: garageServiceSelect, orderBy: garageServiceOrderBy },
      },
    });
  }

  findByIdWithDetails(garageId: number) {
    return prisma.mechanic.findUnique({
      where: { id_mechanic: garageId },
      select: {
        id_mechanic: true,
        name: true,
        city: true,
        address: true,
        image_url: true,
        opening_hours: true,
        description: true,
        latitude: true,
        longitude: true,
        phone: true,
        email: true,
        garage_service: {
          select: garageServiceSelect,
          orderBy: garageServiceOrderBy,
        },
      },
    });
  }

  findOpeningHours(garageId: number) {
    return prisma.mechanic.findUnique({
      where: { id_mechanic: garageId },
      select: { opening_hours: true },
    });
  }

  groupRatingsByMechanicIds(mechanicIds: number[]) {
    return prisma.review.groupBy({
      by: ["id_mechanic"],
      where: { id_mechanic: { in: mechanicIds } },
      _avg: { rating: true },
    });
  }

  aggregateRatingForGarage(garageId: number) {
    return prisma.review.aggregate({
      where: { id_mechanic: garageId },
      _avg: { rating: true },
    });
  }

  findBookingsForDay(garageId: number, dayStart: Date, dayEnd: Date) {
    return prisma.booking.findMany({
      where: {
        id_mechanic: garageId,
        appointment_date: { gte: dayStart, lte: dayEnd },
      },
      select: { appointment_date: true },
    });
  }
}

export const garageRepository = new GarageRepository();
