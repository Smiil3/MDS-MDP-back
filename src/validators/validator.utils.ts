import { type ObjectSchema } from "joi";

type ValidatePayloadResult<T = unknown> = {
  value?: T;
  errors?: string[];
};

export const validatePayload = <T = unknown>(
  schema: ObjectSchema,
  payload: unknown,
  options?: { stripUnknown?: boolean }
): ValidatePayloadResult<T> => {
  const { error, value } = schema.validate(payload, {
    abortEarly: true,
    allowUnknown: false,
    stripUnknown: options?.stripUnknown ?? false,
  });

  if (error) {
    return {
      errors: error.details.map((detail) => detail.message),
    };
  }

  return { value: value as T };
};
