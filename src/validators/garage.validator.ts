import Joi from "joi";

export type NearbyGaragesQuery = {
  lat?: number;
  lng?: number;
  search?: string;
  limit?: number;
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
