import Joi from "joi";
import { validatePayload as validatePayloadBase } from "./validator.utils";

export type AddressSuggestionQuery = {
  query: string;
};

export type CitiesByPostalCodeQuery = {
  postalCode: string;
};

export type SiretParam = {
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
  validatePayloadBase<AddressSuggestionQuery>(addressSuggestionQuerySchema, payload);

export const validateCitiesByPostalCodeQuery = (payload: unknown) =>
  validatePayloadBase<CitiesByPostalCodeQuery>(citiesByPostalCodeQuerySchema, payload);

export const validateSiretParam = (payload: unknown) =>
  validatePayloadBase<SiretParam>(siretParamSchema, payload);
