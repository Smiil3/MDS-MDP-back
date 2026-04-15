import Joi from "joi";

export type MechanicIdParamInput = {
  id: number;
};

export type CreateMechanicInput = {
  name: string;
  email: string;
  password: string;
  address: string;
  zip_code: number;
  city: string;
  siret: string;
  description?: string;
};

export type UpdateMechanicInput = Partial<CreateMechanicInput>;

export const mechanicIdParamSchema = Joi.object<MechanicIdParamInput>({
  id: Joi.number().integer().required(),
}).required();

export const createMechanicSchema = Joi.object<CreateMechanicInput>({
  name: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  password: Joi.string().trim().required(),
  address: Joi.string().trim().required(),
  zip_code: Joi.number().integer().required(),
  city: Joi.string().trim().required(),
  siret: Joi.string().trim().required(),
  description: Joi.string().allow("").optional(),
}).required();

export const updateMechanicSchema = Joi.object<UpdateMechanicInput>({
  name: Joi.string().allow("").optional(),
  email: Joi.string().email().allow("").optional(),
  password: Joi.string().allow("").optional(),
  address: Joi.string().allow("").optional(),
  zip_code: Joi.number().integer().optional(),
  city: Joi.string().allow("").optional(),
  siret: Joi.string().allow("").optional(),
  description: Joi.string().allow("").optional(),
}).required();
