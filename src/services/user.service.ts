import { Prisma } from "@prisma/client";
import { UserRepository, userRepository } from "../repositories/user.repository";
import {
  type CreateVehicleInput,
  type UpdateDriverProfileInput,
} from "../validators/user.validator";

export class EmailAlreadyInUseError extends Error {}

type CreateUserInput = {
  last_name: string;
  first_name: string;
  email: string;
  password: string;
  phone: string;
  birth_date: string;
  id_subscription: number;
};

export type DriverProfileDto = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  birth_date: string;
  image_url: string | null;
};

export type DriverVehicleDto = {
  id: number;
  brand: string;
  model: string;
  year: number;
  engine: string;
  license_plate: string | null;
  fuel_type: string | null;
  mileage: number;
};

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  findAll() {
    return this.userRepository.findAll();
  }

  create(data: CreateUserInput) {
    return this.userRepository.create({
      ...data,
      birth_date: new Date(data.birth_date),
    });
  }

  async findProfileById(driverId: number): Promise<DriverProfileDto | null> {
    const driver = await this.userRepository.findProfileById(driverId);
    if (!driver) return null;
    return this._mapDriverProfile(driver);
  }

  async updateProfileById(
    driverId: number,
    data: UpdateDriverProfileInput,
  ): Promise<DriverProfileDto> {
    try {
      const updatedDriver = await this.userRepository.updateProfileById(driverId, {
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        image_url: data.image_url,
        email: data.email,
        birth_date: data.birth_date ? new Date(data.birth_date) : undefined,
      });
      return this._mapDriverProfile(updatedDriver);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new EmailAlreadyInUseError("Email already in use.");
      }
      throw error;
    }
  }

  async listVehiclesByDriverId(driverId: number): Promise<DriverVehicleDto[]> {
    const vehicles = await this.userRepository.listVehiclesByDriverId(driverId);
    return vehicles.map((v) => this._mapDriverVehicle(v));
  }

  async createVehicleForDriver(
    driverId: number,
    data: CreateVehicleInput,
  ): Promise<DriverVehicleDto> {
    const logbook = await this.userRepository.createMaintenanceLogbook(data.year, data.mileage);
    const vehicle = await this.userRepository.createVehicle({
      brand: data.brand,
      model: data.model,
      year: data.year,
      engine: data.engine,
      license_plate: data.license_plate,
      fuel_type: data.fuel_type || null,
      mileage: data.mileage,
      id_driver: driverId,
      id_maintenance_logbook: logbook.id_maintenance_logbook,
    });
    return this._mapDriverVehicle(vehicle);
  }

  private _mapDriverProfile(driver: {
    id_driver: number;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    birth_date: Date;
    image_url: string | null;
  }): DriverProfileDto {
    return {
      id: driver.id_driver,
      email: driver.email,
      first_name: driver.first_name,
      last_name: driver.last_name,
      phone: driver.phone,
      birth_date: driver.birth_date.toISOString().slice(0, 10),
      image_url: driver.image_url,
    };
  }

  private _mapDriverVehicle(vehicle: {
    id_vehicle: number;
    brand: string;
    model: string;
    year: number;
    engine: string;
    license_plate: string | null;
    fuel_type: string | null;
    mileage: number;
  }): DriverVehicleDto {
    return {
      id: vehicle.id_vehicle,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      engine: vehicle.engine,
      license_plate: vehicle.license_plate,
      fuel_type: vehicle.fuel_type,
      mileage: vehicle.mileage,
    };
  }
}

export const userService = new UserService(userRepository);
