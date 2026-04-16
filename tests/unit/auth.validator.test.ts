import {
  driverLoginSchema,
  driverRegisterSchema,
  mechanicLoginSchema,
  mechanicRegisterSchema,
  refreshTokenSchema,
  validatePayload,
} from "../../src/validators/auth.validator";

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
      image_url: "https://cdn.test/garage.jpg",
      opening_hours: {
        mon: [{ open: "08:00", close: "18:00" }],
        tue: [{ open: "08:00", close: "18:00" }],
        wed: [{ open: "08:00", close: "18:00" }],
        thu: [{ open: "08:00", close: "18:00" }],
        fri: [{ open: "08:00", close: "18:00" }],
        sat: [],
        sun: [],
      },
      services: [
        {
          vidange: [
            { serviceName: "Filtres", price: 12 },
            { serviceName: "Filtres + huile", price: 24 },
          ],
        },
      ],
      siret: "12345678901234",
    });

    expect(result.errors).toBeUndefined();
    expect(result.value).toBeDefined();
  });

  it("rejects mechanic register payload with invalid siret", () => {
    const result = validatePayload(mechanicRegisterSchema, {
      name: "Garage Nord",
      email: "garage@test.dev",
      password: "password123",
      address: "12 rue test",
      zip_code: 75001,
      city: "Paris",
      opening_hours: {
        mon: [{ open: "08:00", close: "18:00" }],
        tue: [{ open: "08:00", close: "18:00" }],
        wed: [{ open: "08:00", close: "18:00" }],
        thu: [{ open: "08:00", close: "18:00" }],
        fri: [{ open: "08:00", close: "18:00" }],
        sat: [],
        sun: [],
      },
      services: [{ vidange: [{ serviceName: "Filtres", price: 12 }] }],
      siret: "ABC123",
    });

    expect(result.value).toBeUndefined();
    expect(result.errors).toBeDefined();
  });

  it("rejects invalid mechanic login payload", () => {
    const result = validatePayload(mechanicLoginSchema, {
      email: "garage@test.dev",
    });

    expect(result.value).toBeUndefined();
    expect(result.errors).toBeDefined();
    expect(result.errors).toHaveLength(1);
  });

  it("rejects mechanic register payload with invalid services structure", () => {
    const result = validatePayload(mechanicRegisterSchema, {
      name: "Garage Nord",
      email: "garage@test.dev",
      password: "password123",
      address: "12 rue test",
      zip_code: 75001,
      city: "Paris",
      opening_hours: {
        mon: [{ open: "08:00", close: "18:00" }],
        tue: [{ open: "08:00", close: "18:00" }],
        wed: [{ open: "08:00", close: "18:00" }],
        thu: [{ open: "08:00", close: "18:00" }],
        fri: [{ open: "08:00", close: "18:00" }],
        sat: [],
        sun: [],
      },
      services: [{ vidange: [{ serviceName: "", price: 12 }] }],
      siret: "12345678901234",
    });

    expect(result.value).toBeUndefined();
    expect(result.errors).toBeDefined();
  });

  it("accepts valid refresh token payload", () => {
    const result = validatePayload(refreshTokenSchema, {
      refreshToken: "some-token",
    });

    expect(result.errors).toBeUndefined();
    expect(result.value).toEqual({ refreshToken: "some-token" });
  });

  it("rejects invalid refresh token payload", () => {
    const result = validatePayload(refreshTokenSchema, {});

    expect(result.value).toBeUndefined();
    expect(result.errors).toBeDefined();
    expect(result.errors).toHaveLength(1);
  });
});
