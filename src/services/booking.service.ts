import { prisma } from "../prisma/client";
import type { CreateBookingInput, UpdateBookingInput } from "../validators/booking.validator";

const bookingSelect = {
  id_booking: true,
  appointment_date: true,
  total_amount: true,
  created_at: true,
  updated_at: true,
  booking_status: {
    select: {
      id_booking_status: true,
      label: true,
    },
  },
  mechanic: {
    select: {
      id_mechanic: true,
      name: true,
      city: true,
      address: true,
    },
  },
  driver: {
    select: {
      id_driver: true,
      last_name: true,
      first_name: true,
      email: true,
      phone: true,
    },
  },
  vehicle: {
    select: {
      id_vehicle: true,
      brand: true,
      model: true,
      license_plate: true,
      fuel_type: true,
    },
  },
  booking_garage_service: {
    select: {
      garage_service: {
        select: {
          id_garage_service: true,
          category: true,
          label: true,
          price: true,
        },
      },
    },
  },
};

export const bookingService = {
  findById(id: number) {
    return prisma.booking.findUnique({
      where: { id_booking: id },
      select: bookingSelect,
    });
  },

  findByDriverId(driverId: number) {
    return prisma.booking.findMany({
      where: { id_driver: driverId },
      select: bookingSelect,
      orderBy: { appointment_date: "desc" },
    });
  },

  async create(data: CreateBookingInput & { id_driver: number }) {
    const services = await prisma.garage_service.findMany({
      where: { id_garage_service: { in: data.service_ids } },
      select: { id_garage_service: true, price: true },
    });

    const total_amount = services.reduce((sum, s) => sum + Number(s.price), 0);

    return prisma.$transaction(async (tx) => {
      return tx.booking.create({
        data: {
          appointment_date: new Date(data.appointment_date),
          total_amount,
          id_mechanic: data.id_mechanic,
          id_booking_status: data.id_booking_status,
          id_driver: data.id_driver,
          id_vehicle: data.id_vehicle,
          booking_garage_service: {
            create: services.map((s) => ({ id_garage_service: s.id_garage_service })),
          },
        },
        select: bookingSelect,
      });
    });
  },

  update(id: number, data: UpdateBookingInput) {
    return prisma.booking.update({
      where: { id_booking: id },
      data: {
        ...(data.appointment_date && { appointment_date: new Date(data.appointment_date) }),
        ...(data.id_booking_status !== undefined && { id_booking_status: data.id_booking_status }),
        ...(data.id_vehicle !== undefined && { id_vehicle: data.id_vehicle }),
      },
      select: bookingSelect,
    });
  },

  delete(id: number) {
    return prisma.booking.delete({
      where: { id_booking: id },
    });
  },
};
