import Joi from "joi";
import { validatePayload as validatePayloadBase } from "./validator.utils";

export type CreateUserInput = {
  last_name: string;
  first_name: string;
  email: string;
  password: string;
  phone: string;
  birth_date: string;
  id_subscription: number;
};

export const createUserSchema = Joi.object<CreateUserInput>({
  last_name: Joi.string().trim().required(),
  first_name: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  password: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  birth_date: Joi.string().trim().required(),
  id_subscription: Joi.number().integer().positive().required(),
}).required();

export type UpdateDriverProfileInput = {
  first_name?: string;
  last_name?: string;
  phone?: string;
  image_url?: string;
  email?: string;
  birth_date?: string;
};

export const updateDriverProfileSchema = Joi.object<UpdateDriverProfileInput>({
  first_name: Joi.string().trim().optional(),
  last_name: Joi.string().trim().optional(),
  phone: Joi.string().trim().optional(),
  image_url: Joi.string().uri().allow("").optional(),
  email: Joi.string().email().optional(),
  birth_date: Joi.date().iso().optional(),
})
  .min(1)
  .required();

export type CreateVehicleInput = {
  brand: string;
  model: string;
  year: number;
  engine: string;
  license_plate: string;
  mileage: number;
  fuel_type?: string;
};

export const createVehicleSchema = Joi.object<CreateVehicleInput>({
  brand: Joi.string().trim().required(),
  model: Joi.string().trim().required(),
  year: Joi.number().integer().min(1900).max(2100).required(),
  engine: Joi.string().trim().required(),
  license_plate: Joi.string().trim().required(),
  mileage: Joi.number().integer().min(0).required(),
  fuel_type: Joi.string().trim().allow("").optional(),
}).required();

export const validatePayload = <T>(schema: Joi.ObjectSchema<T>, payload: unknown) =>
  validatePayloadBase(schema, payload, { stripUnknown: true });
