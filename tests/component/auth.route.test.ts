import jwt from "jsonwebtoken";
import request from "supertest";
import { app } from "../../src/app";
import { GeocodingError } from "../../src/services/geocoding.service";
import { authService } from "../../src/services/auth.service";

jest.mock("../../src/services/auth.service", () => ({
  authService: {
    registerDriver: jest.fn(),
    loginDriver: jest.fn(),
    registerMechanic: jest.fn(),
    loginMechanic: jest.fn(),
    refreshToken: jest.fn(),
  },
}));

const authServiceMock = authService as jest.Mocked<typeof authService>;

describe("auth routes (component)", () => {
  const secret = "route-secret";

  beforeEach(() => {
    process.env.JWT_SECRET = secret;
    jest.clearAllMocks();
  });

  it("POST /api/auth/drivers/register returns 400 on invalid payload", async () => {
    const response = await request(app).post("/api/auth/drivers/register").send({
      email: "not-an-email",
    });

    expect(response.status).toBe(400);
    expect(authServiceMock.registerDriver).not.toHaveBeenCalled();
  });

  it("POST /api/auth/drivers/register returns 201 on success", async () => {
    authServiceMock.registerDriver.mockResolvedValue({
      accessToken: "driver-access-token",
      refreshToken: "driver-refresh-token",
      user: { id: 1, role: "driver", email: "john@test.dev" },
    });

    const response = await request(app).post("/api/auth/drivers/register").send({
      last_name: "Doe",
      first_name: "John",
      email: "john@test.dev",
      password: "password123",
      phone: "0102030405",
      birth_date: "1990-01-01",
      id_subscription: 1,
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      accessToken: "driver-access-token",
      refreshToken: "driver-refresh-token",
      user: { id: 1, role: "driver", email: "john@test.dev" },
    });
  });

  it("POST /api/auth/mechanics/register returns 400 on invalid payload", async () => {
    const response = await request(app).post("/api/auth/mechanics/register").send({
      name: "Garage Test",
      email: "garage@test.dev",
      password: "password123",
      address: "12 rue test",
      zip_code: 75001,
      city: "Paris",
      siret: "BAD",
    });

    expect(response.status).toBe(400);
    expect(authServiceMock.registerMechanic).not.toHaveBeenCalled();
  });

  it("POST /api/auth/mechanics/register returns 201 on success", async () => {
    authServiceMock.registerMechanic.mockResolvedValue({
      accessToken: "mechanic-access-token",
      refreshToken: "mechanic-refresh-token",
      user: { id: 3, role: "mechanic", email: "garage@test.dev" },
    });

    const response = await request(app).post("/api/auth/mechanics/register").send({
      name: "Garage Test",
      email: "garage@test.dev",
      password: "password123",
      address: "12 rue test",
      zip_code: 75001,
      city: "Paris",
      opening_hours: {
        mon: [{ open: "08:00", close: "18:00" }],
        tue: [{ open: "08:00", close: "18:00" }],
        wed: [{ open: "08:00", close: "18:00" }],
        thu: [{ open: "08:00", close: "18:00" }],
        fri: [{ open: "08:00", close: "18:00" }],
        sat: [],
        sun: [],
      },
      siret: "12345678901234",
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      accessToken: "mechanic-access-token",
      refreshToken: "mechanic-refresh-token",
      user: { id: 3, role: "mechanic", email: "garage@test.dev" },
    });
  });

  it("POST /api/auth/mechanics/register returns 400 when geocoding fails", async () => {
    authServiceMock.registerMechanic.mockRejectedValue(
      new GeocodingError("No geocoding result found for this address."),
    );

    const response = await request(app).post("/api/auth/mechanics/register").send({
      name: "Garage Test",
      email: "garage@test.dev",
      password: "password123",
      address: "12 rue test",
      zip_code: 75001,
      city: "Paris",
      opening_hours: {
        mon: [{ open: "08:00", close: "18:00" }],
        tue: [{ open: "08:00", close: "18:00" }],
        wed: [{ open: "08:00", close: "18:00" }],
        thu: [{ open: "08:00", close: "18:00" }],
        fri: [{ open: "08:00", close: "18:00" }],
        sat: [],
        sun: [],
      },
      siret: "12345678901234",
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "No geocoding result found for this address.",
    });
  });

  it("POST /api/auth/mechanics/login returns 401 when credentials are invalid", async () => {
    authServiceMock.loginMechanic.mockResolvedValue(null);

    const response = await request(app).post("/api/auth/mechanics/login").send({
      email: "garage@test.dev",
      password: "password123",
    });

    expect(response.status).toBe(401);
  });

  it("POST /api/auth/refresh returns 401 for invalid refresh token", async () => {
    authServiceMock.refreshToken.mockResolvedValue(null);

    const response = await request(app).post("/api/auth/refresh").send({
      refreshToken: "invalid-token",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Invalid or expired refresh token." });
  });

  it("POST /api/auth/refresh returns 200 for valid refresh token", async () => {
    authServiceMock.refreshToken.mockResolvedValue({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
      user: { id: 3, role: "mechanic", email: "garage@test.dev" },
    });

    const response = await request(app).post("/api/auth/refresh").send({
      refreshToken: "valid-token",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
      user: { id: 3, role: "mechanic", email: "garage@test.dev" },
    });
  });

  it("GET /api/auth/drivers/me returns 401 without token", async () => {
    const response = await request(app).get("/api/auth/drivers/me");
    expect(response.status).toBe(401);
  });

  it("GET /api/auth/drivers/me returns 403 for wrong role", async () => {
    const token = jwt.sign({ sub: "8", role: "mechanic", tokenType: "access" }, secret, {
      expiresIn: "1h",
    });

    const response = await request(app)
      .get("/api/auth/drivers/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it("GET /api/auth/drivers/me returns 200 for driver token", async () => {
    const token = jwt.sign({ sub: "9", role: "driver", tokenType: "access" }, secret, {
      expiresIn: "1h",
    });

    const response = await request(app)
      .get("/api/auth/drivers/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({ sub: "9", role: "driver" });
  });

  it("GET /api/auth/mechanics/me returns 200 for mechanic token", async () => {
    const token = jwt.sign({ sub: "11", role: "mechanic", tokenType: "access" }, secret, {
      expiresIn: "1h",
    });

    const response = await request(app)
      .get("/api/auth/mechanics/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({ sub: "11", role: "mechanic" });
  });
});
