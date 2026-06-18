import Joi from "joi";
import { validatePayload as validatePayloadBase } from "./validator.utils";

export type DriverRegisterInput = {
  last_name: string;
  first_name: string;
  email: string;
  password: string;
  phone: string;
  birth_date: string;
  id_subscription_type?: number;
};

export type DriverLoginInput = {
  email: string;
  password: string;
};

export type MechanicRegisterInput = {
  services: Record<string, { serviceName: string; price: number }[]>[];
  name: string;
  email: string;
  password: string;
  address: string;
  zip_code: number;
  city: string;
  description?: string;
  image_url?: string;
  opening_hours: {
    mon: { open: string; close: string }[];
    tue: { open: string; close: string }[];
    wed: { open: string; close: string }[];
    thu: { open: string; close: string }[];
    fri: { open: string; close: string }[];
    sat: { open: string; close: string }[];
    sun: { open: string; close: string }[];
  };
  siret: string;
};

export type MechanicLoginInput = {
  email: string;
  password: string;
};

export type RefreshTokenInput = {
  refreshToken: string;
};

const openingHourSlotSchema = Joi.object({
  open: Joi.string()
    .pattern(/^([01]\d|2[0-3]):(00|30)$/)
    .required(),
  close: Joi.string()
    .pattern(/^([01]\d|2[0-3]):(00|30)$/)
    .required(),
})
  .custom((value: { open: string; close: string }, helpers) => {
    if (value.open >= value.close) {
      return helpers.error("any.invalid");
    }

    return value;
  }, "opening slot range validation");

const openingHoursSchema = Joi.object({
  mon: Joi.array().items(openingHourSlotSchema).required(),
  tue: Joi.array().items(openingHourSlotSchema).required(),
  wed: Joi.array().items(openingHourSlotSchema).required(),
  thu: Joi.array().items(openingHourSlotSchema).required(),
  fri: Joi.array().items(openingHourSlotSchema).required(),
  sat: Joi.array().items(openingHourSlotSchema).required(),
  sun: Joi.array().items(openingHourSlotSchema).required(),
}).required();

const mechanicServiceSchema = Joi.object({
  serviceName: Joi.string().trim().min(1).required(),
  price: Joi.number().positive().required(),
}).required();

const mechanicServicesSchema = Joi.array()
  .items(
    Joi.object()
      .pattern(
        Joi.string().trim().min(1),
        Joi.array().items(mechanicServiceSchema).min(1).required(),
      )
      .min(1)
      .required(),
  )
  .min(1)
  .required();

export const driverRegisterSchema = Joi.object({
  last_name: Joi.string().required(),
  first_name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  phone: Joi.string().required(),
  birth_date: Joi.date().iso().required(),
  id_subscription_type: Joi.number().integer().positive().optional(),
}).required();

export const driverLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).required();

export const mechanicRegisterSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  address: Joi.string().required(),
  zip_code: Joi.number().integer().min(0).required(),
  city: Joi.string().required(),
  description: Joi.string().allow("").optional(),
  image_url: Joi.string().uri().optional(),
  opening_hours: openingHoursSchema,
  services: mechanicServicesSchema,
  siret: Joi.string().pattern(/^\d{14}$/).required(),
}).required();

export const mechanicLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).required();

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
}).required();

export const validatePayload = (schema: Joi.ObjectSchema, payload: unknown) =>
  validatePayloadBase(schema, payload);
