import Joi from "joi";
import { validatePayload as validatePayloadBase } from "./validator.utils";

export type NearbyGaragesQuery = {
  lat?: number;
  lng?: number;
  search?: string;
  limit?: number;
};

export type GarageIdParam = {
  id: number;
};

export type GarageSlotsQuery = {
  date: string;
};

export const nearbyGaragesQuerySchema = Joi.object({
  lat: Joi.number().min(-90).max(90).optional(),
  lng: Joi.number().min(-180).max(180).optional(),
  search: Joi.string().trim().allow("").optional(),
  limit: Joi.number().integer().min(1).max(20).default(5),
})
  .custom((value: NearbyGaragesQuery, helpers) => {
    const hasLat = typeof value.lat === "number";
    const hasLng = typeof value.lng === "number";

    if (hasLat !== hasLng) {
      return helpers.error("any.invalid");
    }

    return value;
  }, "lat/lng pair validation")
  .required();

export const validateNearbyGaragesQuery = (query: unknown) => {
    return validatePayloadBase<NearbyGaragesQuery>(nearbyGaragesQuerySchema, query);
};

const garageIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
}).required();

export const validateGarageIdParam = (params: unknown) => {
  return validatePayloadBase<GarageIdParam>(garageIdParamSchema, params);
};

const garageSlotsQuerySchema = Joi.object({
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({ "string.pattern.base": "date must be in YYYY-MM-DD format." }),
}).required();

export const validateGarageSlotsQuery = (query: unknown) => {
  return validatePayloadBase<GarageSlotsQuery>(garageSlotsQuerySchema, query);
};
