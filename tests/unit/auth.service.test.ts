import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authService } from "../../src/services/auth.service";
import { geocodingService } from "../../src/services/geocoding.service";
import { prisma } from "../../src/prisma/client";

jest.mock("../../src/prisma/client", () => ({
  prisma: {
    $transaction: jest.fn(),
    driver: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    mechanic: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    garage_service: {
      createMany: jest.fn(),
    },
  },
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

jest.mock("../../src/config/auth.config", () => ({
  getJwtSecret: jest.fn(() => "test-secret"),
  getJwtExpiresIn: jest.fn(() => "1h"),
  getJwtRefreshSecret: jest.fn(() => "test-refresh-secret"),
  getJwtRefreshExpiresIn: jest.fn(() => "7d"),
}));

jest.mock("../../src/services/geocoding.service", () => ({
  geocodingService: {
    geocodeAddress: jest.fn(),
  },
}));

const prismaMock = prisma as unknown as {
  $transaction: jest.Mock;
  driver: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
  mechanic: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
  garage_service: {
    createMany: jest.Mock;
  };
};

const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;
const jwtMock = jwt as jest.Mocked<typeof jwt>;
const geocodingServiceMock = geocodingService as jest.Mocked<typeof geocodingService>;

describe("auth.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jwtMock.sign.mockReset();
    jwtMock.verify.mockReset();
    bcryptMock.hash.mockReset();
    bcryptMock.compare.mockReset();
    geocodingServiceMock.geocodeAddress.mockReset();

    prismaMock.$transaction.mockImplementation(
      async (
        handler: (transaction: {
          mechanic: { create: jest.Mock };
          garage_service: { createMany: jest.Mock };
        }) => Promise<unknown>,
      ) =>
        handler({
          mechanic: { create: prismaMock.mechanic.create },
          garage_service: { createMany: prismaMock.garage_service.createMany },
        }),
    );
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

  it("registerDriver creates user and returns tokens", async () => {
    prismaMock.driver.findUnique.mockResolvedValue(null);
    bcryptMock.hash.mockResolvedValue("hashed-password" as never);
    prismaMock.driver.create.mockResolvedValue({
      id_driver: 10,
      email: "john@test.dev",
    });
    jwtMock.sign
      .mockReturnValueOnce("access-token" as never)
      .mockReturnValueOnce("refresh-token" as never);

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
      accessToken: "access-token",
      refreshToken: "refresh-token",
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

  it("loginMechanic returns tokens when credentials are valid", async () => {
    prismaMock.mechanic.findUnique.mockResolvedValue({
      id_mechanic: 21,
      email: "garage@test.dev",
      password: "hashed-password",
    });
    bcryptMock.compare.mockResolvedValue(true as never);
    jwtMock.sign
      .mockReturnValueOnce("mechanic-access-token" as never)
      .mockReturnValueOnce("mechanic-refresh-token" as never);

    const result = await authService.loginMechanic({
      email: "garage@test.dev",
      password: "password123",
    });

    expect(result).toEqual({
      accessToken: "mechanic-access-token",
      refreshToken: "mechanic-refresh-token",
      user: { id: 21, role: "mechanic", email: "garage@test.dev" },
    });
  });

  it("registerMechanic creates user and stores geocoded coordinates", async () => {
    prismaMock.mechanic.findUnique.mockResolvedValue(null);
    bcryptMock.hash.mockResolvedValue("hashed-mechanic-password" as never);
    geocodingServiceMock.geocodeAddress.mockResolvedValue({
      latitude: 48.8566,
      longitude: 2.3522,
    });
    prismaMock.mechanic.create.mockResolvedValue({
      id_mechanic: 21,
      email: "garage@test.dev",
    });
    jwtMock.sign
      .mockReturnValueOnce("mechanic-access-token" as never)
      .mockReturnValueOnce("mechanic-refresh-token" as never);

    const result = await authService.registerMechanic({
      name: "Garage Test",
      email: "garage@test.dev",
      password: "password123",
      address: "12 rue test",
      zip_code: 75001,
      city: "Paris",
      description: "Garage de test",
      image_url: "https://cdn.test/garage.jpg",
      opening_hours: {
        mon: [{ open: "08:00", close: "18:00" }],
        tue: [{ open: "08:00", close: "18:00" }],
        wed: [{ open: "08:00", close: "18:00" }],
        thu: [{ open: "08:00", close: "18:00" }],
        fri: [{ open: "08:00", close: "18:00" }],
        sat: [],
        sun: [],
      },
      services: [
        {
          vidange: [
            { serviceName: "Filtres", price: 12 },
            { serviceName: "Filtres + huile", price: 24 },
          ],
        },
      ],
      siret: "12345678901234",
    });

    expect(geocodingServiceMock.geocodeAddress).toHaveBeenCalledWith({
      address: "12 rue test",
      zipCode: "75001",
      city: "Paris",
    });
    expect(prismaMock.mechanic.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "garage@test.dev",
        password: "hashed-mechanic-password",
        latitude: 48.8566,
        longitude: 2.3522,
      }),
    });
    expect(prismaMock.garage_service.createMany).toHaveBeenCalledWith({
      data: [
        {
          id_mechanic: 21,
          category: "vidange",
          label: "Filtres",
          price: 12,
          description: "",
        },
        {
          id_mechanic: 21,
          category: "vidange",
          label: "Filtres + huile",
          price: 24,
          description: "",
        },
      ],
    });
    expect(result).toEqual({
      accessToken: "mechanic-access-token",
      refreshToken: "mechanic-refresh-token",
      user: { id: 21, role: "mechanic", email: "garage@test.dev" },
    });
  });

  it("registerMechanic returns null when mechanic already exists", async () => {
    prismaMock.mechanic.findUnique.mockResolvedValue({ id_mechanic: 4 });

    const result = await authService.registerMechanic({
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
      services: [{ vidange: [{ serviceName: "Filtres", price: 12 }] }],
      siret: "12345678901234",
    });

    expect(result).toBeNull();
    expect(geocodingServiceMock.geocodeAddress).not.toHaveBeenCalled();
    expect(prismaMock.mechanic.create).not.toHaveBeenCalled();
  });

  it("refreshToken returns null for invalid token", async () => {
    jwtMock.verify.mockImplementation(() => {
      throw new Error("invalid");
    });

    const result = await authService.refreshToken("bad-token");

    expect(result).toBeNull();
  });

  it("refreshToken returns new tokens for valid driver refresh token", async () => {
    jwtMock.verify.mockReturnValue({
      sub: "7",
      role: "driver",
      tokenType: "refresh",
    } as never);
    prismaMock.driver.findUnique.mockResolvedValue({
      id_driver: 7,
      email: "driver@test.dev",
    });
    jwtMock.sign
      .mockReturnValueOnce("new-access-token" as never)
      .mockReturnValueOnce("new-refresh-token" as never);

    const result = await authService.refreshToken("valid-refresh-token");

    expect(result).toEqual({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
      user: { id: 7, role: "driver", email: "driver@test.dev" },
    });
  });
});
