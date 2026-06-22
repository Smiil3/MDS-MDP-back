import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {Prisma} from "@prisma/client";
import {getJwtExpiresIn, getJwtRefreshExpiresIn, getJwtRefreshSecret, getJwtSecret,} from "../config/auth.config";
import {AuthRepository, authRepository} from "../repositories/auth.repository";
import {geocodingService} from "./geocoding.service";
import {AuthRole, isRefreshTokenPayload, RefreshTokenPayload,} from "../types/auth";
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

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async registerDriver(input: DriverRegisterInput): Promise<AuthResponse | null> {
    const existingDriver = await this.authRepository.findDriverByEmail(input.email);

    if (existingDriver) {
      return null;
    }

    const defaultSubscriptionId = 1;
    const passwordHash = await this._hashPassword(input.password);
    const driver = await this.authRepository.createDriver({
      last_name: input.last_name,
      first_name: input.first_name,
      email: input.email,
      password: passwordHash,
      phone: input.phone,
      birth_date: new Date(input.birth_date),
      id_subscription_type: defaultSubscriptionId,
    });

    return this._createAuthResponse({
      id: driver.id_driver,
      role: AuthRole.DRIVER,
      email: driver.email,
    });
  }

  async loginDriver(input: DriverLoginInput): Promise<AuthResponse | null> {
    const driver = await this.authRepository.findDriverByEmail(input.email);

    if (!driver) {
      return null;
    }

    const isValidPassword = await this._comparePassword(input.password, driver.password);

    if (!isValidPassword) {
      return null;
    }

    return this._createAuthResponse({
      id: driver.id_driver,
      role: AuthRole.DRIVER,
      email: driver.email,
    });
  }

  async registerMechanic(input: MechanicRegisterInput): Promise<AuthResponse | null> {
    const existingMechanic = await this.authRepository.findMechanicByEmail(input.email);

    if (existingMechanic) {
      return null;
    }

    const passwordHash = await this._hashPassword(input.password);

    const { latitude, longitude } = await geocodingService.geocodeAddress({
      address: input.address,
      zipCode: String(input.zip_code),
      city: input.city,
    });

    const services = this._mapMechanicServices(input.services);
    const mechanic = await this.authRepository.createMechanicWithServices(
      {
        name: input.name,
        email: input.email,
        password: passwordHash,
        address: input.address,
        zip_code: input.zip_code,
        city: input.city,
        description: input.description,
        image_url: input.image_url,
        opening_hours: input.opening_hours as Prisma.InputJsonValue,
        latitude,
        longitude,
        siret: input.siret,
      },
      services,
    );

    return this._createAuthResponse({
      id: mechanic.id_mechanic,
      role: AuthRole.MECHANIC,
      email: mechanic.email,
    });
  };

  async loginMechanic(input: MechanicLoginInput): Promise<AuthResponse | null> {
    const mechanic = await this.authRepository.findMechanicByEmail(input.email);

    if (!mechanic) {
      return null;
    }

    const isValidPassword = await this._comparePassword(input.password, mechanic.password);

    if (!isValidPassword) {
      return null;
    }

    return this._createAuthResponse({
      id: mechanic.id_mechanic,
      role: AuthRole.MECHANIC,
      email: mechanic.email,
    });
  };

  async refreshToken(token: string): Promise<AuthResponse | null> {
    const payload = this._verifyRefreshToken(token);

    if (!payload) {
      return null;
    }

    const userId = Number(payload.sub);

    if (!userId) {
      return null;
    }

    if (payload.role === AuthRole.DRIVER) {
      const driver = await this.authRepository.findDriverById(userId);

      if (!driver) {
        return null;
      }

      return this._createAuthResponse({
        id: driver.id_driver,
        role: AuthRole.DRIVER,
        email: driver.email,
      });
    } else {
      const mechanic = await this.authRepository.findMechanicById(userId);

      if (!mechanic) {
        return null;
      }

      return this._createAuthResponse({
        id: mechanic.id_mechanic,
        role: AuthRole.MECHANIC,
        email: mechanic.email,
      });
    }
  }

   private _createAccessToken(sub: string, role: AuthRole) {
     return jwt.sign({ sub, role, tokenType: "access" }, getJwtSecret(), {
       expiresIn: getJwtExpiresIn(),
     });
   }

   private _createRefreshToken(sub: string, role: AuthRole) : string {
     return jwt.sign({ sub, role, tokenType: "refresh" }, getJwtRefreshSecret(), {
       expiresIn: getJwtRefreshExpiresIn(),
     });
   }

   private _hashPassword(password: string) : Promise<string> {
     return bcrypt.hash(password, 10)
   }

   private _comparePassword(password: string, hash: string) : Promise<boolean> {
     return bcrypt.compare(password, hash);
   }

   private _createAuthResponse (user: { id: number; role: AuthRole; email: string }) : AuthResponse {
     return {
       accessToken: this._createAccessToken(String(user.id), user.role),
       refreshToken: this._createRefreshToken(String(user.id), user.role),
       user,
     }
   }

   private _verifyRefreshToken(token: string): RefreshTokenPayload | null {
     try {
       const decoded = jwt.verify(token, getJwtRefreshSecret());

       if (!isRefreshTokenPayload(decoded)) {
         return null;
       }

       return decoded;
     } catch {
       return null;
     }
   }

   private _mapMechanicServices (categories: MechanicRegisterInput["services"]) {
     return categories.flatMap((categoryObject) =>
         Object.entries(categoryObject).flatMap(([category, services]) =>
             services.map((service) => ({
               category,
               label: service.serviceName,
               price: service.price,
               description: "",
             })),
         ),
     )
   }
}

export const authService = new AuthService(authRepository);
