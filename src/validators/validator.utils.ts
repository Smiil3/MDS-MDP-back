import { type ObjectSchema } from "joi";

type ValidatePayloadResult = {
  value?: unknown;
  errors?: string[];
};

export const validatePayload = (
  schema: ObjectSchema,
  payload: unknown,
): ValidatePayloadResult => {
  const { error, value } = schema.validate(payload, {
    abortEarly: true,
    allowUnknown: false,
  });

  if (error) {
    return {
      errors: error.details.map((detail) => detail.message),
    };
  }

  return { value };
};
