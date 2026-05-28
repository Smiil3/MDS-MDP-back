import { BookingStatusRepository, bookingStatusRepository } from "../repositories/bookingStatus.repository";

export type BookingStatusDto = {
  id: number;
  label: string;
};

export class BookingStatusService {
  constructor(private readonly bookingStatusRepository: BookingStatusRepository) {}

  async findAll(): Promise<BookingStatusDto[]> {
    const statuses = await this.bookingStatusRepository.findAll();
    return statuses.map((status) => ({
      id: status.id_booking_status,
      label: status.label,
    }));
  }
}

export const bookingStatusService = new BookingStatusService(bookingStatusRepository);
