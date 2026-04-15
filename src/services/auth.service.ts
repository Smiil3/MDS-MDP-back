import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getJwtExpiresIn, getJwtSecret } from "../config/auth.config";
import { prisma } from "../prisma/client";
import type { AuthRole, AuthTokenPayload } from "../types/auth";
import type {
  DriverLoginInput,
  DriverRegisterInput,
  MechanicLoginInput,
  MechanicRegisterInput,
} from "../validators/auth.validator";

type AuthResponse = {
  token: string;
  user: {
    id: number;
    role: AuthRole;
    email: string;
  };
};

const createToken = (payload: AuthTokenPayload) =>
  jwt.sign(payload, getJwtSecret(), { expiresIn: getJwtExpiresIn() });

const hashPassword = (password: string) => bcrypt.hash(password, 10);

const comparePassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash);

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

    return {
      token: createToken({ sub: String(driver.id_driver), role: "driver" }),
      user: {
        id: driver.id_driver,
        role: "driver",
        email: driver.email,
      },
    };
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

    return {
      token: createToken({ sub: String(driver.id_driver), role: "driver" }),
      user: {
        id: driver.id_driver,
        role: "driver",
        email: driver.email,
      },
    };
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

    return {
      token: createToken({ sub: String(mechanic.id_mechanic), role: "mechanic" }),
      user: {
        id: mechanic.id_mechanic,
        role: "mechanic",
        email: mechanic.email,
      },
    };
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

    return {
      token: createToken({ sub: String(mechanic.id_mechanic), role: "mechanic" }),
      user: {
        id: mechanic.id_mechanic,
        role: "mechanic",
        email: mechanic.email,
      },
    };
  },
};
