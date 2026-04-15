import { prisma } from "../prisma/client";

type CreateBookingInput = {
  appointment_date: string;
  total_amount: number;
  id_mechanic: number;
  id_booking_status: number;
  id_driver: number;
  id_vehicle?: number;
};

type UpdateBookingInput = Partial<CreateBookingInput>;

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
      email: true,
      city: true,
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
};

export const bookingService = {
  findById(id: number) {
    return prisma.booking.findUnique({
      where: { id_booking: id },
      select: bookingSelect,
    });
  },

  create(data: CreateBookingInput) {
    return prisma.booking.create({
      data: {
        appointment_date: new Date(data.appointment_date),
        total_amount: data.total_amount,
        id_mechanic: data.id_mechanic,
        id_booking_status: data.id_booking_status,
        id_driver: data.id_driver,
        id_vehicle: data.id_vehicle,
      },
      select: bookingSelect,
    });
  },

  update(id: number, data: UpdateBookingInput) {
    return prisma.booking.update({
      where: { id_booking: id },
      data: {
        ...(data.appointment_date && { appointment_date: new Date(data.appointment_date) }),
        ...(data.total_amount !== undefined && { total_amount: data.total_amount }),
        ...(data.id_mechanic !== undefined && { id_mechanic: data.id_mechanic }),
        ...(data.id_booking_status !== undefined && { id_booking_status: data.id_booking_status }),
        ...(data.id_driver !== undefined && { id_driver: data.id_driver }),
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
