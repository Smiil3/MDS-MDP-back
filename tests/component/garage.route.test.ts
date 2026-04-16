import request from "supertest";
import { app } from "../../src/app";
import { garageService } from "../../src/services/garage.service";

jest.mock("../../src/services/garage.service", () => ({
  garageService: {
    findNearby: jest.fn(),
    findById: jest.fn(),
  },
}));

const garageServiceMock = garageService as jest.Mocked<typeof garageService>;

describe("garage routes (component)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /api/garages/nearby returns 400 on invalid lat/lng query", async () => {
    const response = await request(app).get("/api/garages/nearby?lat=48.8566");

    expect(response.status).toBe(400);
    expect(garageServiceMock.findNearby).not.toHaveBeenCalled();
  });

  it("GET /api/garages/nearby returns 200 with garages payload", async () => {
    garageServiceMock.findNearby.mockResolvedValue([
      {
        id: 1,
        name: "Garage Paris Centre",
        city: "Paris",
        address: "1 rue de Rivoli",
        latitude: 48.8566,
        longitude: 2.3522,
        imageUrl: "https://cdn.test/garage.jpg",
        openingHours: { mon: { open: "08:00", close: "18:00" } },
        description: "Réparation auto rapide",
        distanceMeters: 320,
      },
    ]);

    const response = await request(app).get(
      "/api/garages/nearby?lat=48.8566&lng=2.3522&search=paris&limit=5",
    );

    expect(response.status).toBe(200);
    expect(garageServiceMock.findNearby).toHaveBeenCalledWith({
      lat: 48.8566,
      lng: 2.3522,
      search: "paris",
      limit: 5,
    });
    expect(response.body).toEqual({
      garages: [
        {
          id: 1,
          name: "Garage Paris Centre",
          city: "Paris",
          address: "1 rue de Rivoli",
          latitude: 48.8566,
          longitude: 2.3522,
          imageUrl: "https://cdn.test/garage.jpg",
          openingHours: { mon: { open: "08:00", close: "18:00" } },
          description: "Réparation auto rapide",
          distanceMeters: 320,
        },
      ],
    });
  });

  it("GET /api/garages/:id returns 400 on invalid id", async () => {
    const response = await request(app).get("/api/garages/abc");

    expect(response.status).toBe(400);
    expect(garageServiceMock.findById).not.toHaveBeenCalled();
  });

  it("GET /api/garages/:id returns 404 when garage does not exist", async () => {
    garageServiceMock.findById.mockResolvedValue(null);

    const response = await request(app).get("/api/garages/99");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Garage not found." });
  });

  it("GET /api/garages/:id returns 200 with wrapped garage payload", async () => {
    garageServiceMock.findById.mockResolvedValue({
      id: 1,
      name: "Garage Paris Centre",
      city: "Paris",
      address: "1 rue de Rivoli",
      latitude: 48.8566,
      longitude: 2.3522,
      imageUrl: "https://cdn.test/garage.jpg",
      openingHours: { mon: [{ open: "08:00", close: "18:00" }] },
      description: "Réparation auto rapide",
      services: [
        {
          vidange: [
            { serviceName: "Filtres", price: 12 },
            { serviceName: "Filtres + huile", price: 24 },
          ],
        },
      ],
    });

    const response = await request(app).get("/api/garages/1");

    expect(response.status).toBe(200);
    expect(garageServiceMock.findById).toHaveBeenCalledWith(1);
    expect(response.body).toEqual({
      garage: {
        id: 1,
        name: "Garage Paris Centre",
        city: "Paris",
        address: "1 rue de Rivoli",
        latitude: 48.8566,
        longitude: 2.3522,
        imageUrl: "https://cdn.test/garage.jpg",
        openingHours: { mon: [{ open: "08:00", close: "18:00" }] },
        description: "Réparation auto rapide",
        services: [
          {
            vidange: [
              { serviceName: "Filtres", price: 12 },
              { serviceName: "Filtres + huile", price: 24 },
            ],
          },
        ],
      },
    });
  });
});
