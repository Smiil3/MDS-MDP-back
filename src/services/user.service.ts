import { prisma } from "../prisma/client";

type CreateUserInput = {
  email: string;
  name: string;
};

export const userService = {
  findAll() {
    return prisma.user.findMany({
      orderBy: {
        id: "desc",
      },
    });
  },
  create(data: CreateUserInput) {
    return prisma.user.create({ data });
  },
};
