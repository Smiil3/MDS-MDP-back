import { Prisma } from "@prisma/client";
import { prisma } from "../../src/prisma/client";
import { garageService } from "../../src/services/garage.service";

jest.mock("../../src/prisma/client", () => ({
  prisma: {
    mechanic: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

const prismaMock = prisma as unknown as {
  mechanic: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
  };
};

const weekdayOpeningHours: Prisma.JsonValue = {
  mon: { open: "08:00", close: "18:00" },
  tue: { open: "08:00", close: "18:00" },
};

describe("garage.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns default sorted garages without distance when coords are missing", async () => {
    prismaMock.mechanic.findMany.mockResolvedValue([
      {
        id_mechanic: 1,
        name: "Alpha Garage",
        city: "Lyon",
        address: "1 rue A",
        image_url: null,
        opening_hours: weekdayOpeningHours,
        description: "Garage A",
        latitude: null,
        longitude: null,
      },
    ]);

    const result = await garageService.findNearby({ search: "Lyon", limit: 5 });

    expect(prismaMock.mechanic.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { name: "asc" },
        take: 5,
      }),
    );
    expect(result).toEqual([
      {
        id: 1,
        name: "Alpha Garage",
        city: "Lyon",
        address: "1 rue A",
        latitude: null,
        longitude: null,
        imageUrl: null,
        openingHours: weekdayOpeningHours,
        description: "Garage A",
        distanceMeters: null,
      },
    ]);
  });

  it("sorts garages by computed distance when coords are provided", async () => {
    prismaMock.mechanic.findMany.mockResolvedValue([
      {
        id_mechanic: 2,
        name: "Far Garage",
        city: "Paris",
        address: "20 rue B",
        image_url: "https://img/far.jpg",
        opening_hours: weekdayOpeningHours,
        description: "Far",
        latitude: 48.9566,
        longitude: 2.4522,
      },
      {
        id_mechanic: 3,
        name: "Near Garage",
        city: "Paris",
        address: "10 rue C",
        image_url: "https://img/near.jpg",
        opening_hours: weekdayOpeningHours,
        description: "Near",
        latitude: 48.857,
        longitude: 2.3523,
      },
    ]);

    const result = await garageService.findNearby({
      lat: 48.8566,
      lng: 2.3522,
      limit: 5,
    });

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Near Garage");
    expect(result[0].latitude).toBe(48.857);
    expect(result[0].longitude).toBe(2.3523);
    expect(result[0].distanceMeters).not.toBeNull();
    expect(result[1].name).toBe("Far Garage");
  });

  it("returns garage details with categorized services", async () => {
    prismaMock.mechanic.findUnique.mockResolvedValue({
      id_mechanic: 7,
      name: "Garage Details",
      city: "Paris",
      address: "7 rue test",
      image_url: "https://img/details.jpg",
      opening_hours: weekdayOpeningHours,
      description: "Garage detail description",
      latitude: 48.8566,
      longitude: 2.3522,
      garage_service: [
        {
          category: "vidange",
          label: "Filtres",
          price: new Prisma.Decimal(12),
        },
        {
          category: "vidange",
          label: "Filtres + huile",
          price: new Prisma.Decimal(24),
        },
        {
          category: "freinage",
          label: "Plaquettes",
          price: new Prisma.Decimal(80),
        },
      ],
    });

    const result = await garageService.findById(7);

    expect(prismaMock.mechanic.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id_mechanic: 7 },
      }),
    );
    expect(result).toEqual({
      id: 7,
      name: "Garage Details",
      city: "Paris",
      address: "7 rue test",
      latitude: 48.8566,
      longitude: 2.3522,
      imageUrl: "https://img/details.jpg",
      openingHours: weekdayOpeningHours,
      description: "Garage detail description",
      services: [
        {
          vidange: [
            { serviceName: "Filtres", price: 12 },
            { serviceName: "Filtres + huile", price: 24 },
          ],
        },
        {
          freinage: [{ serviceName: "Plaquettes", price: 80 }],
        },
      ],
    });
  });

  it("returns null when garage details are missing", async () => {
    prismaMock.mechanic.findUnique.mockResolvedValue(null);
    const result = await garageService.findById(99);
    expect(result).toBeNull();
  });
});
