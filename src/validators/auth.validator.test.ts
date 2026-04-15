import {
  driverLoginSchema,
  driverRegisterSchema,
  mechanicLoginSchema,
  mechanicRegisterSchema,
  validatePayload,
} from "./auth.validator";

describe("auth.validator", () => {
  it("accepts a valid driver register payload and strips unknown fields", () => {
    const payload = {
      last_name: "Doe",
      first_name: "John",
      email: "john.doe@test.dev",
      password: "password123",
      phone: "0102030405",
      birth_date: "1990-01-01",
      id_subscription: 1,
      unknown: "remove-me",
    };

    const result = validatePayload(driverRegisterSchema, payload);

    expect(result.errors).toBeUndefined();
    expect(result.value).toBeDefined();
    expect(result.value).toMatchObject({
      last_name: "Doe",
      first_name: "John",
      email: "john.doe@test.dev",
      password: "password123",
      phone: "0102030405",
      id_subscription: 1,
    });
    expect((result.value as Record<string, unknown>).unknown).toBeUndefined();
  });

  it("rejects invalid driver login payload", () => {
    const result = validatePayload(driverLoginSchema, { email: "not-an-email" });

    expect(result.value).toBeUndefined();
    expect(result.errors).toBeDefined();
    expect(result.errors).toHaveLength(2);
  });

  it("accepts valid mechanic register payload", () => {
    const result = validatePayload(mechanicRegisterSchema, {
      name: "Garage Nord",
      email: "garage@test.dev",
      password: "password123",
      address: "12 rue test",
      zip_code: 75001,
      city: "Paris",
      description: "Garage de test",
      siret: "12345678900011",
    });

    expect(result.errors).toBeUndefined();
    expect(result.value).toBeDefined();
  });

  it("rejects invalid mechanic login payload", () => {
    const result = validatePayload(mechanicLoginSchema, {
      email: "garage@test.dev",
      password: "short",
    });

    expect(result.value).toBeUndefined();
    expect(result.errors).toBeDefined();
    expect(result.errors).toHaveLength(1);
  });
});
