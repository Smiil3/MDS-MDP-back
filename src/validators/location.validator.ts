import Joi from "joi";
import { validatePayload as validatePayloadBase } from "./validator.utils";

type AddressSuggestionQuery = {
  query: string;
};

type CitiesByPostalCodeQuery = {
  postalCode: string;
};

type SiretParam = {
  siret: string;
};

const addressSuggestionQuerySchema = Joi.object({
  query: Joi.string().trim().min(3).required(),
}).required();

const citiesByPostalCodeQuerySchema = Joi.object({
  postalCode: Joi.string().pattern(/^\d{5}$/).required(),
}).required();

const siretParamSchema = Joi.object({
  siret: Joi.string().pattern(/^\d{14}$/).required(),
}).required();

export const validateAddressSuggestionQuery = (payload: unknown) =>
  validatePayloadBase(addressSuggestionQuerySchema, payload);

export const validateCitiesByPostalCodeQuery = (payload: unknown) =>
  validatePayloadBase(citiesByPostalCodeQuerySchema, payload);

export const validateSiretParam = (payload: unknown) =>
  validatePayloadBase(siretParamSchema, payload);
