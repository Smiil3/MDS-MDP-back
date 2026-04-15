import Joi from "joi";
import { validatePayload as validatePayloadBase } from "./validator.utils";

export type DriverRegisterInput = {
  last_name: string;
  first_name: string;
  email: string;
  password: string;
  phone: string;
  birth_date: string;
  id_subscription: number;
};

export type DriverLoginInput = {
  email: string;
  password: string;
};

export type MechanicRegisterInput = {
  name: string;
  email: string;
  password: string;
  address: string;
  zip_code: number;
  city: string;
  description?: string;
  siret: string;
};

export type MechanicLoginInput = {
  email: string;
  password: string;
};

export type RefreshTokenInput = {
  refreshToken: string;
};

export const driverRegisterSchema = Joi.object<DriverRegisterInput>({
  last_name: Joi.string().required(),
  first_name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  phone: Joi.string().required(),
  birth_date: Joi.date().iso().required(),
  id_subscription: Joi.number().integer().positive().required(),
}).required();

export const driverLoginSchema = Joi.object<DriverLoginInput>({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).required();

export const mechanicRegisterSchema = Joi.object<MechanicRegisterInput>({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  address: Joi.string().required(),
  zip_code: Joi.number().integer().min(0).required(),
  city: Joi.string().required(),
  description: Joi.string().allow("").optional(),
  siret: Joi.string().required(),
}).required();

export const mechanicLoginSchema = Joi.object<MechanicLoginInput>({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).required();

export const refreshTokenSchema = Joi.object<RefreshTokenInput>({
  refreshToken: Joi.string().required(),
}).required();

export const validatePayload = <T>(schema: Joi.ObjectSchema<T>, payload: unknown) =>
  validatePayloadBase(schema, payload, { stripUnknown: true });
