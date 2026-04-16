import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";
import { NearbyGaragesQuery } from "../validators/garage.validator";

export type GarageCardDto = {
  id: number;
  name: string;
  city: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
  openingHours: Prisma.JsonValue | null;
  description: string | null;
  distanceMeters: number | null;
};

export type GarageServiceDto = {
  serviceName: string;
  price: number;
};

export type GarageServicesDto = Record<string, GarageServiceDto[]>[];

export type GarageDetailsDto = Omit<GarageCardDto, "distanceMeters"> & {
  services: GarageServicesDto;
};

type MechanicProjection = {
  id_mechanic: number;
  name: string;
  city: string;
  address: string;
  image_url: string | null;
  opening_hours: Prisma.JsonValue | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
};

type MechanicDetailsProjection = MechanicProjection & {
  garage_service: {
    category: string;
    label: string;
    price: Prisma.Decimal;
  }[];
};

const EARTH_RADIUS_METERS = 6_371_000;

const toRadians = (value: number) => (value * Math.PI) / 180;

const computeDistanceMeters = (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
) => {
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);
  const originLat = toRadians(fromLat);
  const targetLat = toRadians(toLat);

  const haversineA =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(originLat) *
      Math.cos(targetLat) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(haversineA), Math.sqrt(1 - haversineA));
};

const toGarageCardDto = (
  mechanic: MechanicProjection,
  distanceMeters: number | null,
): GarageCardDto => ({
  id: mechanic.id_mechanic,
  name: mechanic.name,
  city: mechanic.city,
  address: mechanic.address,
  latitude: mechanic.latitude,
  longitude: mechanic.longitude,
  imageUrl: mechanic.image_url,
  openingHours: mechanic.opening_hours,
  description: mechanic.description,
  distanceMeters,
});

const toCategorizedServices = (
  services: MechanicDetailsProjection["garage_service"],
): GarageServicesDto => {
  const grouped = services.reduce<Record<string, GarageServiceDto[]>>((accumulator, service) => {
    const category = service.category.trim();
    if (!accumulator[category]) {
      accumulator[category] = [];
    }
    accumulator[category].push({
      serviceName: service.label,
      price: Number(service.price),
    });
    return accumulator;
  }, {});

  return Object.entries(grouped).map(([category, categoryServices]) => ({
    [category]: categoryServices,
  }));
};

const toGarageDetailsDto = (mechanic: MechanicDetailsProjection): GarageDetailsDto => ({
  id: mechanic.id_mechanic,
  name: mechanic.name,
  city: mechanic.city,
  address: mechanic.address,
  latitude: mechanic.latitude,
  longitude: mechanic.longitude,
  imageUrl: mechanic.image_url,
  openingHours: mechanic.opening_hours,
  description: mechanic.description,
  services: toCategorizedServices(mechanic.garage_service),
});

const buildSearchWhere = (search: string | undefined): Prisma.mechanicWhereInput => {
  const normalizedSearch = search?.trim();
  if (!normalizedSearch) {
    return {};
  }

  return {
    OR: [
      { name: { contains: normalizedSearch } },
      { city: { contains: normalizedSearch } },
    ],
  };
};

export type BookedSlotDto = {
  appointmentDate: string;
};

export const garageService = {
  async findNearby(query: NearbyGaragesQuery): Promise<GarageCardDto[]> {
    const limit = query.limit ?? 5;
    const where = buildSearchWhere(query.search);
    const hasCoords = typeof query.lat === "number" && typeof query.lng === "number";

    if (!hasCoords) {
      const mechanics = await prisma.mechanic.findMany({
        where,
        orderBy: {
          name: "asc",
        },
        take: limit,
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
        },
      });

      return mechanics.map((mechanic) => toGarageCardDto(mechanic, null));
    }

    const lat = query.lat;
    const lng = query.lng;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return [];
    }

    const mechanics = await prisma.mechanic.findMany({
      where: {
        AND: [where, { latitude: { not: null } }, { longitude: { not: null } }],
      },
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
      },
    });

    const withDistance = mechanics
      .flatMap((mechanic) => {
        if (typeof mechanic.latitude !== "number" || typeof mechanic.longitude !== "number") {
          return [];
        }

        const distanceMeters = computeDistanceMeters(
          lat,
          lng,
          mechanic.latitude,
          mechanic.longitude,
        );

        return [{ mechanic, distanceMeters }];
      })
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, limit);

    return withDistance.map(({ mechanic, distanceMeters }) =>
      toGarageCardDto(mechanic, Math.round(distanceMeters)),
    );
  },

  async findBookedSlots(garageId: number, date: string): Promise<BookedSlotDto[]> {
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    const bookings = await prisma.booking.findMany({
      where: {
        id_mechanic: garageId,
        appointment_date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      select: {
        appointment_date: true,
      },
      orderBy: {
        appointment_date: "asc",
      },
    });

    return bookings.map((booking) => ({
      appointmentDate: booking.appointment_date.toISOString(),
    }));
  },

  async findById(garageId: number): Promise<GarageDetailsDto | null> {
    const mechanic = await prisma.mechanic.findUnique({
      where: {
        id_mechanic: garageId,
      },
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
        garage_service: {
          select: {
            category: true,
            label: true,
            price: true,
          },
          orderBy: [{ category: "asc" }, { id_garage_service: "asc" }],
        },
      },
    });

    if (!mechanic) {
      return null;
    }

    return toGarageDetailsDto(mechanic);
  },
};
