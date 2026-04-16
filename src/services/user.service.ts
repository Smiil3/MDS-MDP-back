import { prisma } from "../prisma/client";
import {
  type CreateVehicleInput,
  type UpdateDriverProfileInput,
} from "../validators/user.validator";

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

const mapDriverProfile = (driver: {
  id_driver: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  birth_date: Date;
  image_url: string | null;
}): DriverProfileDto => ({
  id: driver.id_driver,
  email: driver.email,
  first_name: driver.first_name,
  last_name: driver.last_name,
  phone: driver.phone,
  birth_date: driver.birth_date.toISOString().slice(0, 10),
  image_url: driver.image_url,
});

const mapDriverVehicle = (vehicle: {
  id_vehicle: number;
  brand: string;
  model: string;
  year: number;
  engine: string;
  license_plate: string | null;
  fuel_type: string | null;
  mileage: number;
}): DriverVehicleDto => ({
  id: vehicle.id_vehicle,
  brand: vehicle.brand,
  model: vehicle.model,
  year: vehicle.year,
  engine: vehicle.engine,
  license_plate: vehicle.license_plate,
  fuel_type: vehicle.fuel_type,
  mileage: vehicle.mileage,
});

export const userService = {
  findAll() {
    return prisma.driver.findMany({
      orderBy: {
        id_driver: "desc",
      },
    });
  },
  create(data: CreateUserInput) {
    return prisma.driver.create({
      data: {
        last_name: data.last_name,
        first_name: data.first_name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        birth_date: new Date(data.birth_date),
        id_subscription: data.id_subscription,
      },
    });
  },
  async findProfileById(driverId: number): Promise<DriverProfileDto | null> {
    const driver = await prisma.driver.findUnique({
      where: { id_driver: driverId },
      select: {
        id_driver: true,
        email: true,
        first_name: true,
        last_name: true,
        phone: true,
        birth_date: true,
        image_url: true,
      },
    });

    if (!driver) {
      return null;
    }

    return mapDriverProfile(driver);
  },
  async updateProfileById(
    driverId: number,
    data: UpdateDriverProfileInput,
  ): Promise<DriverProfileDto> {
    const updatedDriver = await prisma.driver.update({
      where: { id_driver: driverId },
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        image_url: data.image_url,
        email: data.email,
        birth_date: data.birth_date ? new Date(data.birth_date) : undefined,
      },
      select: {
        id_driver: true,
        email: true,
        first_name: true,
        last_name: true,
        phone: true,
        birth_date: true,
        image_url: true,
      },
    });

    return mapDriverProfile(updatedDriver);
  },
  async listVehiclesByDriverId(driverId: number): Promise<DriverVehicleDto[]> {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        id_driver: driverId,
      },
      orderBy: {
        id_vehicle: "desc",
      },
      select: {
        id_vehicle: true,
        brand: true,
        model: true,
        year: true,
        engine: true,
        license_plate: true,
        fuel_type: true,
        mileage: true,
      },
    });

    return vehicles.map(mapDriverVehicle);
  },
  async createVehicleForDriver(
    driverId: number,
    data: CreateVehicleInput,
  ): Promise<DriverVehicleDto> {
    const createdVehicle = await prisma.$transaction(async (transaction) => {
      const logbook = await transaction.maintenance_logbook.create({
        data: {
          year: data.year,
          mileage: BigInt(data.mileage),
        },
      });

      return transaction.vehicle.create({
        data: {
          brand: data.brand,
          model: data.model,
          year: data.year,
          engine: data.engine,
          license_plate: data.license_plate,
          fuel_type: data.fuel_type || null,
          mileage: data.mileage,
          id_driver: driverId,
          id_maintenance_logbook: logbook.id_maintenance_logbook,
        },
        select: {
          id_vehicle: true,
          brand: true,
          model: true,
          year: true,
          engine: true,
          license_plate: true,
          fuel_type: true,
          mileage: true,
        },
      });
    });

    return mapDriverVehicle(createdVehicle);
  },
};
