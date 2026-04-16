import {
  validateGarageIdParam,
  validateNearbyGaragesQuery,
} from "../../src/validators/garage.validator";

describe("garage.validator", () => {
  it("accepts empty query and applies default limit", () => {
    const result = validateNearbyGaragesQuery({});
    expect(result.errors).toBeUndefined();
    expect(result.value).toEqual({ limit: 5 });
  });

  it("rejects query with only lat", () => {
    const result = validateNearbyGaragesQuery({ lat: "48.8566" });
    expect(result.value).toBeUndefined();
    expect(result.errors).toContain("lat and lng must be provided together.");
  });

  it("accepts valid nearby query", () => {
    const result = validateNearbyGaragesQuery({
      lat: "48.8566",
      lng: "2.3522",
      search: "Paris",
      limit: "3",
    });

    expect(result.errors).toBeUndefined();
    expect(result.value).toEqual({
      lat: 48.8566,
      lng: 2.3522,
      search: "Paris",
      limit: 3,
    });
  });

  it("accepts valid garage id param", () => {
    const result = validateGarageIdParam({ id: "12" });
    expect(result.errors).toBeUndefined();
    expect(result.value).toEqual({ id: 12 });
  });

  it("rejects invalid garage id param", () => {
    const result = validateGarageIdParam({ id: "abc" });
    expect(result.value).toBeUndefined();
    expect(result.errors).toBeDefined();
  });
});
