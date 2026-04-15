import { prisma } from "../prisma/client";

type CreateUserInput = {
  last_name: string;
  first_name: string;
  email: string;
  password: string;
  phone: string;
  birth_date: string;
  id_subscription: number;
};

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
};
