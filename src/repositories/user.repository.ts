import { prisma } from "../prisma/client";

type CreateUserData = {
  last_name: string;
  first_name: string;
  email: string;
  password: string;
  phone: string;
  birth_date: Date;
  id_subscription: number;
};

type UpdateDriverData = {
  first_name?: string;
  last_name?: string;
  phone?: string;
  image_url?: string | null;
  email?: string;
  birth_date?: Date;
};

type CreateVehicleData = {
  brand: string;
  model: string;
  year: number;
  engine: string;
  license_plate?: string | null;
  fuel_type?: string | null;
  mileage: number;
  id_driver: number;
  id_maintenance_logbook: number;
};

export class UserRepository {
  findAll() {
    return prisma.driver.findMany({ orderBy: { id_driver: "desc" } });
  }

  create(data: CreateUserData) {
    return prisma.driver.create({ data });
  }

  findProfileById(driverId: number) {
    return prisma.driver.findUnique({
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
  }

  updateProfileById(driverId: number, data: UpdateDriverData) {
    return prisma.driver.update({
      where: { id_driver: driverId },
      data,
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
  }

  listVehiclesByDriverId(driverId: number) {
    return prisma.vehicle.findMany({
      where: { id_driver: driverId },
      orderBy: { id_vehicle: "desc" },
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
  }

  createVehicle(data: CreateVehicleData) {
    return prisma.vehicle.create({
      data,
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
  }

  createMaintenanceLogbook(year: number, mileage: number) {
    return prisma.maintenance_logbook.create({
      data: { year, mileage: BigInt(mileage) },
    });
  }
}

export const userRepository = new UserRepository();
