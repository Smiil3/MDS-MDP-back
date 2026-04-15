import request from "supertest";
import { app } from "../../src/app";
import { mechanicService } from "../../src/services/mechanic.service";

jest.mock("../../src/services/mechanic.service", () => ({
  mechanicService: {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findBookings: jest.fn(),
    findServices: jest.fn(),
    findReviews: jest.fn(),
  },
}));

const mechanicServiceMock = mechanicService as jest.Mocked<typeof mechanicService>;

describe("mechanic routes (component)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /api/mechanics returns 200", async () => {
    mechanicServiceMock.findAll.mockResolvedValue([{ id_mechanic: 1 } as never]);

    const response = await request(app).get("/api/mechanics");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id_mechanic: 1 }]);
  });

  it("GET /api/mechanics/:id returns 400 for invalid id", async () => {
    const response = await request(app).get("/api/mechanics/abc");
    expect(response.status).toBe(400);
  });

  it("GET /api/mechanics/:id returns 404 when mechanic is missing", async () => {
    mechanicServiceMock.findById.mockResolvedValue(null);

    const response = await request(app).get("/api/mechanics/10");

    expect(response.status).toBe(404);
  });

  it("POST /api/mechanics returns 400 on unknown field", async () => {
    const response = await request(app).post("/api/mechanics").send({
      name: "Garage Nord",
      email: "garage@test.dev",
      password: "password123",
      address: "12 rue test",
      zip_code: 75001,
      city: "Paris",
      siret: "12345678900011",
      unknown: "forbidden",
    });

    expect(response.status).toBe(400);
    expect(mechanicServiceMock.create).not.toHaveBeenCalled();
  });

  it("POST /api/mechanics returns 201 on success", async () => {
    mechanicServiceMock.create.mockResolvedValue({
      id_mechanic: 2,
      name: "Garage Sud",
    } as never);

    const response = await request(app).post("/api/mechanics").send({
      name: "Garage Sud",
      email: "garage.sud@test.dev",
      password: "password123",
      address: "34 rue test",
      zip_code: 69001,
      city: "Lyon",
      siret: "22345678900011",
      description: "",
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id_mechanic: 2, name: "Garage Sud" });
  });

  it("PUT /api/mechanics/:id returns 400 on invalid payload", async () => {
    mechanicServiceMock.findById.mockResolvedValue({ id_mechanic: 1 } as never);

    const response = await request(app).put("/api/mechanics/1").send({
      unknown: "forbidden",
    });

    expect(response.status).toBe(400);
    expect(mechanicServiceMock.update).not.toHaveBeenCalled();
  });

  it("PUT /api/mechanics/:id returns 400 when no valid field is provided", async () => {
    mechanicServiceMock.findById.mockResolvedValue({ id_mechanic: 1 } as never);

    const response = await request(app).put("/api/mechanics/1").send({
      description: "",
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "No valid fields provided for update." });
  });

  it("PUT /api/mechanics/:id returns 200 on success", async () => {
    mechanicServiceMock.findById.mockResolvedValue({ id_mechanic: 1 } as never);
    mechanicServiceMock.update.mockResolvedValue({
      id_mechanic: 1,
      city: "Marseille",
    } as never);

    const response = await request(app).put("/api/mechanics/1").send({
      city: "Marseille",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id_mechanic: 1, city: "Marseille" });
  });

  it("DELETE /api/mechanics/:id returns 204 on success", async () => {
    mechanicServiceMock.findById.mockResolvedValue({ id_mechanic: 1 } as never);
    mechanicServiceMock.delete.mockResolvedValue({} as never);

    const response = await request(app).delete("/api/mechanics/1");

    expect(response.status).toBe(204);
  });

  it("GET /api/mechanics/:id/bookings returns 200 on success", async () => {
    mechanicServiceMock.findById.mockResolvedValue({ id_mechanic: 1 } as never);
    mechanicServiceMock.findBookings.mockResolvedValue([{ id_booking: 10 } as never]);

    const response = await request(app).get("/api/mechanics/1/bookings");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id_booking: 10 }]);
  });

  it("GET /api/mechanics/:id/services returns 200 on success", async () => {
    mechanicServiceMock.findById.mockResolvedValue({ id_mechanic: 1 } as never);
    mechanicServiceMock.findServices.mockResolvedValue([{ id_garage_service: 3 } as never]);

    const response = await request(app).get("/api/mechanics/1/services");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id_garage_service: 3 }]);
  });

  it("GET /api/mechanics/:id/reviews returns 200 on success", async () => {
    mechanicServiceMock.findById.mockResolvedValue({ id_mechanic: 1 } as never);
    mechanicServiceMock.findReviews.mockResolvedValue([{ id_review: 4 } as never]);

    const response = await request(app).get("/api/mechanics/1/reviews");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id_review: 4 }]);
  });
});
