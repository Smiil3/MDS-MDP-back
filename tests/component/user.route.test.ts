import jwt from "jsonwebtoken";
import request from "supertest";
import { app } from "../../src/app";
import { userService } from "../../src/services/user.service";

jest.mock("../../src/services/user.service", () => ({
  userService: {
    findAll: jest.fn(),
    create: jest.fn(),
    findProfileById: jest.fn(),
    updateProfileById: jest.fn(),
    listVehiclesByDriverId: jest.fn(),
    createVehicleForDriver: jest.fn(),
  },
}));

const userServiceMock = userService as jest.Mocked<typeof userService>;

describe("user routes (component)", () => {
  const secret = "route-secret";

  beforeEach(() => {
    process.env.JWT_SECRET = secret;
    jest.clearAllMocks();
  });

  it("GET /api/users returns 200", async () => {
    userServiceMock.findAll.mockResolvedValue([
      { id_driver: 1, email: "john@test.dev" } as never,
    ]);

    const response = await request(app).get("/api/users");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id_driver: 1, email: "john@test.dev" }]);
  });

  it("POST /api/users returns 400 on invalid payload", async () => {
    const response = await request(app).post("/api/users").send({
      email: "not-an-email",
    });

    expect(response.status).toBe(400);
    expect(userServiceMock.create).not.toHaveBeenCalled();
  });

  it("POST /api/users returns 400 on unknown field", async () => {
    const response = await request(app).post("/api/users").send({
      last_name: "Doe",
      first_name: "John",
      email: "john@test.dev",
      password: "password123",
      phone: "0102030405",
      birth_date: "1990-01-01",
      id_subscription: 1,
      extra: "forbidden",
    });

    expect(response.status).toBe(400);
    expect(userServiceMock.create).not.toHaveBeenCalled();
  });

  it("POST /api/users returns 201 on success", async () => {
    userServiceMock.create.mockResolvedValue({
      id_driver: 2,
      email: "jane@test.dev",
    } as never);

    const response = await request(app).post("/api/users").send({
      last_name: "Doe",
      first_name: "Jane",
      email: "jane@test.dev",
      password: "password123",
      phone: "0102030405",
      birth_date: "1990-01-01",
      id_subscription: 1,
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id_driver: 2, email: "jane@test.dev" });
  });

  it("GET /api/users/me returns 200 for authenticated driver", async () => {
    userServiceMock.findProfileById.mockResolvedValue({
      id: 9,
      email: "john@test.dev",
      first_name: "John",
      last_name: "Doe",
      phone: "0102030405",
      birth_date: "1990-01-01",
      image_url: null,
    } as never);

    const token = jwt.sign({ sub: "9", role: "driver", tokenType: "access" }, secret, {
      expiresIn: "1h",
    });

    const response = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.profile).toMatchObject({
      id: 9,
      email: "john@test.dev",
    });
  });

  it("PATCH /api/users/me returns 400 on invalid payload", async () => {
    const token = jwt.sign({ sub: "9", role: "driver", tokenType: "access" }, secret, {
      expiresIn: "1h",
    });

    const response = await request(app)
      .patch("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({
        phone: "",
      });

    expect(response.status).toBe(400);
    expect(userServiceMock.updateProfileById).not.toHaveBeenCalled();
  });

  it("PATCH /api/users/me returns 200 on success", async () => {
    userServiceMock.updateProfileById.mockResolvedValue({
      id: 9,
      email: "john@test.dev",
      first_name: "John",
      last_name: "Doe",
      phone: "0607080910",
      birth_date: "1990-01-01",
      image_url: "https://img/avatar.jpg",
    } as never);

    const token = jwt.sign({ sub: "9", role: "driver", tokenType: "access" }, secret, {
      expiresIn: "1h",
    });

    const response = await request(app)
      .patch("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({
        phone: "0607080910",
        image_url: "https://img/avatar.jpg",
      });

    expect(response.status).toBe(200);
    expect(response.body.profile.phone).toBe("0607080910");
  });

  it("GET /api/users/me/vehicles returns vehicles", async () => {
    userServiceMock.listVehiclesByDriverId.mockResolvedValue([
      {
        id: 3,
        brand: "Peugeot",
        model: "208",
        year: 2020,
        engine: "1.2 PureTech",
        license_plate: "AA-123-BB",
        fuel_type: "Essence",
        mileage: 53210,
      },
    ] as never);

    const token = jwt.sign({ sub: "9", role: "driver", tokenType: "access" }, secret, {
      expiresIn: "1h",
    });

    const response = await request(app)
      .get("/api/users/me/vehicles")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.vehicles).toHaveLength(1);
    expect(response.body.vehicles[0].brand).toBe("Peugeot");
  });

  it("POST /api/users/me/vehicles returns 201 on success", async () => {
    userServiceMock.createVehicleForDriver.mockResolvedValue({
      id: 8,
      brand: "Renault",
      model: "Clio",
      year: 2022,
      engine: "TCe 90",
      license_plate: "CC-456-DD",
      fuel_type: "Essence",
      mileage: 12000,
    } as never);

    const token = jwt.sign({ sub: "9", role: "driver", tokenType: "access" }, secret, {
      expiresIn: "1h",
    });

    const response = await request(app)
      .post("/api/users/me/vehicles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        brand: "Renault",
        model: "Clio",
        year: 2022,
        engine: "TCe 90",
        license_plate: "CC-456-DD",
        mileage: 12000,
        fuel_type: "Essence",
      });

    expect(response.status).toBe(201);
    expect(response.body.vehicle).toMatchObject({
      id: 8,
      brand: "Renault",
    });
  });
});
