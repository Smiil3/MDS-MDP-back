import { BookingRepository, bookingRepository } from "../repositories/booking.repository";
import type { CreateBookingInput, UpdateBookingInput } from "../validators/booking.validator";

export class BookingService {
  constructor(private readonly bookingRepository: BookingRepository) {}

  findById(id: number) {
    return this.bookingRepository.findById(id);
  }

  findByDriverId(driverId: number) {
    return this.bookingRepository.findByDriverId(driverId);
  }

  async create(data: CreateBookingInput & { id_driver: number }) {
    const services = await this.bookingRepository.findServicePrices(data.service_ids);
    const total_amount = services.reduce((sum, s) => sum + Number(s.price), 0);
    return this.bookingRepository.create({
      appointment_date: new Date(data.appointment_date),
      total_amount,
      id_mechanic: data.id_mechanic,
      id_booking_status: data.id_booking_status,
      id_driver: data.id_driver,
      id_vehicle: data.id_vehicle,
      service_ids: services.map((s) => s.id_garage_service),
    });
  }

  update(id: number, data: UpdateBookingInput) {
    return this.bookingRepository.update(id, data);
  }

  delete(id: number) {
    return this.bookingRepository.delete(id);
  }
}

export const bookingService = new BookingService(bookingRepository);
