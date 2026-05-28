import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";

type CreateDriverData = {
  last_name: string;
  first_name: string;
  email: string;
  password: string;
  phone: string;
  birth_date: Date;
  id_subscription: number;
};

type CreateMechanicData = {
  name: string;
  email: string;
  password: string;
  address: string;
  zip_code: number;
  city: string;
  description?: string;
  image_url?: string;
  opening_hours: Prisma.InputJsonValue;
  latitude: number;
  longitude: number;
  siret: string;
};

type MechanicServiceData = {
  category: string;
  label: string;
  price: number;
  description: string;
};

export class AuthRepository {
  findDriverByEmail(email: string) {
    return prisma.driver.findUnique({
      where: { email },
    });
  }

  findMechanicByEmail(email: string) {
    return prisma.mechanic.findUnique({
      where: { email },
    });
  }

  findDriverById(id_driver: number) {
    return prisma.driver.findUnique({
      where: { id_driver },
    });
  }

  findMechanicById(id_mechanic: number) {
    return prisma.mechanic.findUnique({
      where: { id_mechanic },
    });
  }

  createDriver(data: CreateDriverData) {
    return prisma.driver.create({ data });
  }

  createMechanicWithServices(
    mechanicData: CreateMechanicData,
    services: MechanicServiceData[],
  ) {
    return prisma.$transaction(async (transaction) => {
      const createdMechanic = await transaction.mechanic.create({
        data: mechanicData,
      });

      if (services.length > 0) {
        await transaction.garage_service.createMany({
          data: services.map((service) => ({
            ...service,
            id_mechanic: createdMechanic.id_mechanic,
          })),
        });
      }

      return createdMechanic;
    });
  }
}

export const authRepository = new AuthRepository();

