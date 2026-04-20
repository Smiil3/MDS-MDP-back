import { prisma } from "../prisma/client";

type CreateMechanicInput = {
  name: string;
  email: string;
  password: string;
  address: string;
  zip_code: number;
  city: string;
  siret: string;
  description?: string;
};

type UpdateMechanicInput = Partial<CreateMechanicInput>;

export const mechanicService = {
  findAll() {
    return prisma.mechanic.findMany({
      orderBy: { id_mechanic: "desc" },
      select: {
        id_mechanic: true,
        name: true,
        email: true,
        address: true,
        zip_code: true,
        city: true,
        description: true,
        siret: true,
      },
    });
  },

  findById(id: number) {
    return prisma.mechanic.findUnique({
      where: { id_mechanic: id },
      select: {
        id_mechanic: true,
        name: true,
        email: true,
        address: true,
        zip_code: true,
        city: true,
        description: true,
        siret: true,
        booking: {
          select: {
            id_booking: true,
            appointment_date: true,
            total_amount: true,
            created_at: true,
            id_booking_status: true,
            id_driver: true,
          },
        },
        garage_service: {
          select: {
            id_garage_service: true,
            label: true,
            price: true,
            description: true,
          },
        },
        review: {
          select: {
            id_review: true,
            rating: true,
            description: true,
            date: true,
            id_driver: true,
          },
        },
      },
    });
  },

  create(data: CreateMechanicInput) {
    return prisma.mechanic.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        address: data.address,
        zip_code: data.zip_code,
        city: data.city,
        siret: data.siret,
        description: data.description,
      },
      select: {
        id_mechanic: true,
        name: true,
        email: true,
        address: true,
        zip_code: true,
        city: true,
        description: true,
        siret: true,
      },
    });
  },

  update(id: number, data: UpdateMechanicInput) {
    return prisma.mechanic.update({
      where: { id_mechanic: id },
      data,
      select: {
        id_mechanic: true,
        name: true,
        email: true,
        address: true,
        zip_code: true,
        city: true,
        description: true,
        siret: true,
      },
    });
  },

  delete(id: number) {
    return prisma.mechanic.delete({
      where: { id_mechanic: id },
    });
  },

  findBookings(id: number) {
    return prisma.booking.findMany({
      where: { id_mechanic: id },
      orderBy: { appointment_date: "desc" },
      include: {
        booking_status: true,
        driver: {
          select: {
            id_driver: true,
            last_name: true,
            first_name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  },

  findServices(id: number) {
    return prisma.garage_service.findMany({
      where: { id_mechanic: id },
      orderBy: { id_garage_service: "asc" },
    });
  },

  async findReviews(id: number, skip: number, take: number) {
    const [reviews, total, aggregate] = await prisma.$transaction([
      prisma.review.findMany({
        where: { id_mechanic: id },
        orderBy: { date: "desc" },
        skip,
        take,
        select: {
          id_review: true,
          rating: true,
          description: true,
          date: true,
          driver: {
            select: {
              id_driver: true,
              last_name: true,
              first_name: true,
            },
          },
        },
      }),
      prisma.review.count({ where: { id_mechanic: id } }),
      prisma.review.aggregate({
        where: { id_mechanic: id },
        _avg: { rating: true },
      }),
    ]);

    return { reviews, total, average: aggregate._avg.rating };
  },
};
