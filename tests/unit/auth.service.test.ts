import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authService } from "../../src/services/auth.service";
import { prisma } from "../../src/prisma/client";

jest.mock("../../src/prisma/client", () => ({
  prisma: {
    driver: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    mechanic: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

jest.mock("../../src/config/auth.config", () => ({
  getJwtSecret: jest.fn(() => "test-secret"),
  getJwtExpiresIn: jest.fn(() => "1h"),
}));

const prismaMock = prisma as unknown as {
  driver: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
  mechanic: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
};

const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;
const jwtMock = jwt as jest.Mocked<typeof jwt>;

describe("auth.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registerDriver returns null when email already exists", async () => {
    prismaMock.driver.findUnique.mockResolvedValue({ id_driver: 1 });

    const result = await authService.registerDriver({
      last_name: "Doe",
      first_name: "John",
      email: "john@test.dev",
      password: "password123",
      phone: "0102030405",
      birth_date: "1990-01-01",
      id_subscription: 1,
    });

    expect(result).toBeNull();
    expect(prismaMock.driver.create).not.toHaveBeenCalled();
    expect(bcryptMock.hash).not.toHaveBeenCalled();
  });

  it("registerDriver creates user and returns token", async () => {
    prismaMock.driver.findUnique.mockResolvedValue(null);
    bcryptMock.hash.mockResolvedValue("hashed-password" as never);
    prismaMock.driver.create.mockResolvedValue({
      id_driver: 10,
      email: "john@test.dev",
    });
    jwtMock.sign.mockReturnValue("jwt-token" as never);

    const result = await authService.registerDriver({
      last_name: "Doe",
      first_name: "John",
      email: "john@test.dev",
      password: "password123",
      phone: "0102030405",
      birth_date: "1990-01-01",
      id_subscription: 1,
    });

    expect(prismaMock.driver.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "john@test.dev",
        password: "hashed-password",
      }),
    });
    expect(result).toEqual({
      token: "jwt-token",
      user: { id: 10, role: "driver", email: "john@test.dev" },
    });
  });

  it("loginDriver returns null when password is invalid", async () => {
    prismaMock.driver.findUnique.mockResolvedValue({
      id_driver: 12,
      email: "john@test.dev",
      password: "hashed-password",
    });
    bcryptMock.compare.mockResolvedValue(false as never);

    const result = await authService.loginDriver({
      email: "john@test.dev",
      password: "bad-password",
    });

    expect(result).toBeNull();
  });

  it("loginMechanic returns token when credentials are valid", async () => {
    prismaMock.mechanic.findUnique.mockResolvedValue({
      id_mechanic: 21,
      email: "garage@test.dev",
      password: "hashed-password",
    });
    bcryptMock.compare.mockResolvedValue(true as never);
    jwtMock.sign.mockReturnValue("mechanic-token" as never);

    const result = await authService.loginMechanic({
      email: "garage@test.dev",
      password: "password123",
    });

    expect(result).toEqual({
      token: "mechanic-token",
      user: { id: 21, role: "mechanic", email: "garage@test.dev" },
    });
  });
});
