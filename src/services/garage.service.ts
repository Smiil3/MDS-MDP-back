import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";
import { NearbyGaragesQuery } from "../validators/garage.validator";

export type GarageCardDto = {
  id: number;
  name: string;
  city: string;
  address: string;
  imageUrl: string | null;
  openingHours: Prisma.JsonValue | null;
  description: string | null;
  distanceMeters: number | null;
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
  imageUrl: mechanic.image_url,
  openingHours: mechanic.opening_hours,
  description: mechanic.description,
  distanceMeters,
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
};
