import { type ObjectSchema } from "joi";

type ValidatePayloadOptions = {
  stripUnknown?: boolean;
};

export const validatePayload = <T>(
  schema: ObjectSchema<T>,
  payload: unknown,
  options: ValidatePayloadOptions = {},
) => {
  const { error, value } = schema.validate(payload, {
    abortEarly: false,
    stripUnknown: options.stripUnknown ?? false,
  });

  if (error) {
    return {
      errors: error.details.map((detail) => detail.message),
    };
  }

  return { value };
};
