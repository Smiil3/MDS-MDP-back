import Joi, { type ObjectSchema } from "joi";

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

export const driverRegisterSchema = Joi.object<DriverRegisterInput>({
  last_name: Joi.string().trim().min(1).max(100).required(),
  first_name: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().trim().email().max(100).required(),
  password: Joi.string().min(8).max(100).required(),
  phone: Joi.string().trim().min(1).max(50).required(),
  birth_date: Joi.date().iso().required(),
  id_subscription: Joi.number().integer().positive().required(),
}).required();

export const driverLoginSchema = Joi.object<DriverLoginInput>({
  email: Joi.string().trim().email().max(100).required(),
  password: Joi.string().min(8).max(100).required(),
}).required();

export const mechanicRegisterSchema = Joi.object<MechanicRegisterInput>({
  name: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().trim().email().max(100).required(),
  password: Joi.string().min(8).max(100).required(),
  address: Joi.string().trim().min(1).max(150).required(),
  zip_code: Joi.number().integer().min(0).required(),
  city: Joi.string().trim().min(1).max(100).required(),
  description: Joi.string().trim().allow("").max(65535).optional(),
  siret: Joi.string().trim().min(1).max(150).required(),
}).required();

export const mechanicLoginSchema = Joi.object<MechanicLoginInput>({
  email: Joi.string().trim().email().max(100).required(),
  password: Joi.string().min(8).max(100).required(),
}).required();

export const validatePayload = <T>(schema: ObjectSchema<T>, payload: unknown) => {
  const { error, value } = schema.validate(payload, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return {
      errors: error.details.map((detail) => detail.message),
    };
  }

  return { value };
};
