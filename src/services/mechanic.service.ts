import { MechanicRepository, mechanicRepository } from "../repositories/mechanic.repository";

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

export class MechanicService {
  constructor(private readonly mechanicRepository: MechanicRepository) {}

  findAll() {
    return this.mechanicRepository.findAll();
  }

  findById(id: number) {
    return this.mechanicRepository.findById(id);
  }

  create(data: CreateMechanicInput) {
    return this.mechanicRepository.create(data);
  }

  update(id: number, data: UpdateMechanicInput) {
    return this.mechanicRepository.update(id, data);
  }

  delete(id: number) {
    return this.mechanicRepository.delete(id);
  }

  findBookings(id: number) {
    return this.mechanicRepository.findBookings(id);
  }

  findServices(id: number) {
    return this.mechanicRepository.findServices(id);
  }

  async findReviews(id: number, skip: number, take: number) {
    const [reviews, total, aggregate] = await this.mechanicRepository.findReviews(id, skip, take);
    return { reviews, total, average: aggregate._avg.rating };
  }
}

export const mechanicService = new MechanicService(mechanicRepository);
