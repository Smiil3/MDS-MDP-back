import Joi from "joi";

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
