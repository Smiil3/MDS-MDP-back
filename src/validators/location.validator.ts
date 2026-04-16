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

const addressSuggestionQuerySchema = Joi.object<AddressSuggestionQuery>({
  query: Joi.string().trim().min(3).required(),
}).required();

const citiesByPostalCodeQuerySchema = Joi.object<CitiesByPostalCodeQuery>({
  postalCode: Joi.string().pattern(/^\d{5}$/).required(),
}).required();

const siretParamSchema = Joi.object<SiretParam>({
  siret: Joi.string().pattern(/^\d{14}$/).required(),
}).required();

export const validateAddressSuggestionQuery = (payload: unknown) =>
  validatePayloadBase(addressSuggestionQuerySchema, payload, { stripUnknown: true });

export const validateCitiesByPostalCodeQuery = (payload: unknown) =>
  validatePayloadBase(citiesByPostalCodeQuerySchema, payload, { stripUnknown: true });

export const validateSiretParam = (payload: unknown) =>
  validatePayloadBase(siretParamSchema, payload, { stripUnknown: true });
