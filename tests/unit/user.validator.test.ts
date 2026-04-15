import { createUserSchema } from "../../src/validators/user.validator";
import { validatePayload } from "../../src/validators/validator.utils";

describe("user.validator", () => {
  it("accepts a valid create user payload", () => {
    const result = validatePayload(createUserSchema, {
      last_name: "Doe",
      first_name: "John",
      email: "john.doe@test.dev",
      password: "password123",
      phone: "0102030405",
      birth_date: "1990-01-01",
      id_subscription: 1,
    });

    expect(result.errors).toBeUndefined();
    expect(result.value).toBeDefined();
  });

  it("rejects payload with unknown field", () => {
    const result = validatePayload(createUserSchema, {
      last_name: "Doe",
      first_name: "John",
      email: "john.doe@test.dev",
      password: "password123",
      phone: "0102030405",
      birth_date: "1990-01-01",
      id_subscription: 1,
      unknown: "forbidden",
    });

    expect(result.value).toBeUndefined();
    expect(result.errors).toBeDefined();
    expect(result.errors?.[0]).toContain("\"unknown\" is not allowed");
  });

  it("rejects invalid create user payload", () => {
    const result = validatePayload(createUserSchema, {
      email: "not-an-email",
    });

    expect(result.value).toBeUndefined();
    expect(result.errors).toBeDefined();
  });
});
