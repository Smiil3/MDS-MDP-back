import { MechanicRepository, mechanicRepository } from "../repositories/mechanic.repository";

export class NoValidFieldsError extends Error {}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

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
    const patch: Record<string, unknown> = {};
    if (isNonEmptyString(data.name)) patch.name = data.name!.trim();
    if (isNonEmptyString(data.email)) patch.email = data.email!.trim();
    if (isNonEmptyString(data.password)) patch.password = data.password!.trim();
    if (isNonEmptyString(data.address)) patch.address = data.address!.trim();
    if (typeof data.zip_code === "number") patch.zip_code = data.zip_code;
    if (isNonEmptyString(data.city)) patch.city = data.city!.trim();
    if (isNonEmptyString(data.siret)) patch.siret = data.siret!.trim();
    if (isNonEmptyString(data.description)) patch.description = data.description!.trim();

    if (Object.keys(patch).length === 0) {
      throw new NoValidFieldsError("No valid fields provided for update.");
    }

    return this.mechanicRepository.update(id, patch);
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
