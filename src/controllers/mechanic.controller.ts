import { type Request, type Response } from "express";
import { mechanicService } from "../services/mechanic.service";

type IdParam = { id: string };

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const parseId = (param: string): number | null => {
  const id = parseInt(param, 10);
  return isNaN(id) ? null : id;
};

export const mechanicController = {
  async getAll(_req: Request, res: Response) {
    const mechanics = await mechanicService.findAll();
    res.status(200).json(mechanics);
  },

  async getById(req: Request<IdParam>, res: Response) {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: "Invalid mechanic id." });
      return;
    }

    const mechanic = await mechanicService.findById(id);
    if (!mechanic) {
      res.status(404).json({ message: "Mechanic not found." });
      return;
    }

    res.status(200).json(mechanic);
  },

  async create(req: Request, res: Response) {
    const { name, email, password, address, zip_code, city, siret, description } =
      req.body as {
        name?: unknown;
        email?: unknown;
        password?: unknown;
        address?: unknown;
        zip_code?: unknown;
        city?: unknown;
        siret?: unknown;
        description?: unknown;
      };

    if (
      !isNonEmptyString(name) ||
      !isNonEmptyString(email) ||
      !isNonEmptyString(password) ||
      !isNonEmptyString(address) ||
      typeof zip_code !== "number" ||
      !isNonEmptyString(city) ||
      !isNonEmptyString(siret)
    ) {
      res.status(400).json({
        message:
          "Fields 'name', 'email', 'password', 'address', numeric 'zip_code', 'city' and 'siret' are required.",
      });
      return;
    }

    const mechanic = await mechanicService.create({
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      address: address.trim(),
      zip_code,
      city: city.trim(),
      siret: siret.trim(),
      description: isNonEmptyString(description) ? description.trim() : undefined,
    });

    res.status(201).json(mechanic);
  },

  async update(req: Request<IdParam>, res: Response) {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: "Invalid mechanic id." });
      return;
    }

    const existing = await mechanicService.findById(id);
    if (!existing) {
      res.status(404).json({ message: "Mechanic not found." });
      return;
    }

    const { name, email, password, address, zip_code, city, siret, description } =
      req.body as {
        name?: unknown;
        email?: unknown;
        password?: unknown;
        address?: unknown;
        zip_code?: unknown;
        city?: unknown;
        siret?: unknown;
        description?: unknown;
      };

    const data: Record<string, unknown> = {};
    if (isNonEmptyString(name)) data.name = name.trim();
    if (isNonEmptyString(email)) data.email = email.trim();
    if (isNonEmptyString(password)) data.password = password.trim();
    if (isNonEmptyString(address)) data.address = address.trim();
    if (typeof zip_code === "number") data.zip_code = zip_code;
    if (isNonEmptyString(city)) data.city = city.trim();
    if (isNonEmptyString(siret)) data.siret = siret.trim();
    if (isNonEmptyString(description)) data.description = description.trim();

    if (Object.keys(data).length === 0) {
      res.status(400).json({ message: "No valid fields provided for update." });
      return;
    }

    const mechanic = await mechanicService.update(id, data);
    res.status(200).json(mechanic);
  },

  async remove(req: Request<IdParam>, res: Response) {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: "Invalid mechanic id." });
      return;
    }

    const existing = await mechanicService.findById(id);
    if (!existing) {
      res.status(404).json({ message: "Mechanic not found." });
      return;
    }

    await mechanicService.delete(id);
    res.status(204).send();
  },

  async getBookings(req: Request<IdParam>, res: Response) {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: "Invalid mechanic id." });
      return;
    }

    const existing = await mechanicService.findById(id);
    if (!existing) {
      res.status(404).json({ message: "Mechanic not found." });
      return;
    }

    const bookings = await mechanicService.findBookings(id);
    res.status(200).json(bookings);
  },

  async getServices(req: Request<IdParam>, res: Response) {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: "Invalid mechanic id." });
      return;
    }

    const existing = await mechanicService.findById(id);
    if (!existing) {
      res.status(404).json({ message: "Mechanic not found." });
      return;
    }

    const services = await mechanicService.findServices(id);
    res.status(200).json(services);
  },

  async getReviews(req: Request<IdParam>, res: Response) {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: "Invalid mechanic id." });
      return;
    }

    const existing = await mechanicService.findById(id);
    if (!existing) {
      res.status(404).json({ message: "Mechanic not found." });
      return;
    }

    const reviews = await mechanicService.findReviews(id);
    res.status(200).json(reviews);
  },
};
