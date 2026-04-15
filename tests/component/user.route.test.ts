import request from "supertest";
import { app } from "../../src/app";
import { userService } from "../../src/services/user.service";

jest.mock("../../src/services/user.service", () => ({
  userService: {
    findAll: jest.fn(),
    create: jest.fn(),
  },
}));

const userServiceMock = userService as jest.Mocked<typeof userService>;

describe("user routes (component)", () => {
  beforeEach(() => {
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
});
