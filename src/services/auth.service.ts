import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  getJwtExpiresIn,
  getJwtRefreshExpiresIn,
  getJwtRefreshSecret,
  getJwtSecret,
} from "../config/auth.config";
import { prisma } from "../prisma/client";
import {
  isRefreshTokenPayload,
  type AuthRole,
  type AuthTokenPayload,
  type RefreshTokenPayload,
} from "../types/auth";
import type {
  DriverLoginInput,
  DriverRegisterInput,
  MechanicLoginInput,
  MechanicRegisterInput,
} from "../validators/auth.validator";

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    role: AuthRole;
    email: string;
  };
};

const createAccessToken = (payload: Omit<AuthTokenPayload, "tokenType">) =>
  jwt.sign({ ...payload, tokenType: "access" }, getJwtSecret(), {
    expiresIn: getJwtExpiresIn(),
  });

const createRefreshToken = (payload: Omit<RefreshTokenPayload, "tokenType">) =>
  jwt.sign({ ...payload, tokenType: "refresh" }, getJwtRefreshSecret(), {
    expiresIn: getJwtRefreshExpiresIn(),
  });

const verifyRefreshToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, getJwtRefreshSecret());

    if (!isRefreshTokenPayload(decoded)) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
};

const hashPassword = (password: string) => bcrypt.hash(password, 10);

const comparePassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash);

const createAuthResponse = (user: { id: number; role: AuthRole; email: string }) => ({
  accessToken: createAccessToken({ sub: String(user.id), role: user.role }),
  refreshToken: createRefreshToken({ sub: String(user.id), role: user.role }),
  user,
});

const parseUserId = (sub: string) => {
  const userId = Number.parseInt(sub, 10);

  return Number.isNaN(userId) ? null : userId;
};

export const authService = {
  async registerDriver(input: DriverRegisterInput): Promise<AuthResponse | null> {
    const existingDriver = await prisma.driver.findUnique({
      where: { email: input.email },
    });

    if (existingDriver) {
      return null;
    }

    const passwordHash = await hashPassword(input.password);
    const driver = await prisma.driver.create({
      data: {
        last_name: input.last_name,
        first_name: input.first_name,
        email: input.email,
        password: passwordHash,
        phone: input.phone,
        birth_date: new Date(input.birth_date),
        id_subscription: input.id_subscription,
      },
    });

    return createAuthResponse({
      id: driver.id_driver,
      role: "driver",
      email: driver.email,
    });
  },

  async loginDriver(input: DriverLoginInput): Promise<AuthResponse | null> {
    const driver = await prisma.driver.findUnique({
      where: { email: input.email },
    });

    if (!driver) {
      return null;
    }

    const isValidPassword = await comparePassword(input.password, driver.password);

    if (!isValidPassword) {
      return null;
    }

    return createAuthResponse({
      id: driver.id_driver,
      role: "driver",
      email: driver.email,
    });
  },

  async registerMechanic(
    input: MechanicRegisterInput,
  ): Promise<AuthResponse | null> {
    const existingMechanic = await prisma.mechanic.findUnique({
      where: { email: input.email },
    });

    if (existingMechanic) {
      return null;
    }

    const passwordHash = await hashPassword(input.password);
    const mechanic = await prisma.mechanic.create({
      data: {
        name: input.name,
        email: input.email,
        password: passwordHash,
        address: input.address,
        zip_code: input.zip_code,
        city: input.city,
        description: input.description,
        siret: input.siret,
      },
    });

    return createAuthResponse({
      id: mechanic.id_mechanic,
      role: "mechanic",
      email: mechanic.email,
    });
  },

  async loginMechanic(input: MechanicLoginInput): Promise<AuthResponse | null> {
    const mechanic = await prisma.mechanic.findUnique({
      where: { email: input.email },
    });

    if (!mechanic) {
      return null;
    }

    const isValidPassword = await comparePassword(input.password, mechanic.password);

    if (!isValidPassword) {
      return null;
    }

    return createAuthResponse({
      id: mechanic.id_mechanic,
      role: "mechanic",
      email: mechanic.email,
    });
  },

  async refreshToken(token: string): Promise<AuthResponse | null> {
    const payload = verifyRefreshToken(token);

    if (!payload) {
      return null;
    }

    const userId = parseUserId(payload.sub);

    if (!userId) {
      return null;
    }

    if (payload.role === "driver") {
      const driver = await prisma.driver.findUnique({
        where: { id_driver: userId },
      });

      if (!driver) {
        return null;
      }

      return createAuthResponse({
        id: driver.id_driver,
        role: "driver",
        email: driver.email,
      });
    }

    const mechanic = await prisma.mechanic.findUnique({
      where: { id_mechanic: userId },
    });

    if (!mechanic) {
      return null;
    }

    return createAuthResponse({
      id: mechanic.id_mechanic,
      role: "mechanic",
      email: mechanic.email,
    });
  },
};
