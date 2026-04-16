import Joi from "joi";

export type NearbyGaragesQuery = {
  lat?: number;
  lng?: number;
  search?: string;
  limit?: number;
};

export type GarageIdParam = {
  id: number;
};

export const nearbyGaragesQuerySchema = Joi.object<NearbyGaragesQuery>({
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
  const { error, value } = nearbyGaragesQuerySchema.validate(query, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return {
      errors: error.details.map((detail) =>
        detail.type === "any.invalid"
          ? "lat and lng must be provided together."
          : detail.message,
      ),
    };
  }

  return { value };
};

const garageIdParamSchema = Joi.object<GarageIdParam>({
  id: Joi.number().integer().positive().required(),
}).required();

export const validateGarageIdParam = (params: unknown) => {
  const { error, value } = garageIdParamSchema.validate(params, {
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

export type GarageSlotsQuery = {
  date: string;
};

const garageSlotsQuerySchema = Joi.object<GarageSlotsQuery>({
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({ "string.pattern.base": "date must be in YYYY-MM-DD format." }),
}).required();

export const validateGarageSlotsQuery = (query: unknown) => {
  const { error, value } = garageSlotsQuerySchema.validate(query, {
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
