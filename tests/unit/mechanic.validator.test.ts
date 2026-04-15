import {
  createMechanicSchema,
  mechanicIdParamSchema,
  updateMechanicSchema,
} from "../../src/validators/mechanic.validator";
import { validatePayload } from "../../src/validators/validator.utils";

describe("mechanic.validator", () => {
  it("accepts valid mechanic id params and converts id to number", () => {
    const result = validatePayload(mechanicIdParamSchema, { id: "12" });

    expect(result.errors).toBeUndefined();
    expect(result.value).toEqual({ id: 12 });
  });

  it("rejects invalid mechanic id params", () => {
    const result = validatePayload(mechanicIdParamSchema, { id: "abc" });

    expect(result.value).toBeUndefined();
    expect(result.errors).toBeDefined();
  });

  it("accepts valid create mechanic payload", () => {
    const result = validatePayload(createMechanicSchema, {
      name: "Garage Nord",
      email: "garage@test.dev",
      password: "password123",
      address: "12 rue test",
      zip_code: 75001,
      city: "Paris",
      siret: "12345678900011",
      description: "",
    });

    expect(result.errors).toBeUndefined();
    expect(result.value).toBeDefined();
  });

  it("rejects create payload with unknown field", () => {
    const result = validatePayload(createMechanicSchema, {
      name: "Garage Nord",
      email: "garage@test.dev",
      password: "password123",
      address: "12 rue test",
      zip_code: 75001,
      city: "Paris",
      siret: "12345678900011",
      extra: "forbidden",
    });

    expect(result.value).toBeUndefined();
    expect(result.errors).toBeDefined();
    expect(result.errors?.[0]).toContain("\"extra\" is not allowed");
  });

  it("accepts partial update payload", () => {
    const result = validatePayload(updateMechanicSchema, {
      city: "Lyon",
    });

    expect(result.errors).toBeUndefined();
    expect(result.value).toEqual({ city: "Lyon" });
  });
});
