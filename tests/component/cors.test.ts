import request from "supertest";
import { app } from "../../src/app";

describe("cors middleware (component)", () => {
  const configuredOrigin = "http://localhost:8081";

  it("adds Access-Control-Allow-Origin for an allowed origin", async () => {
    const response = await request(app).get("/health").set("Origin", configuredOrigin);

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe(configuredOrigin);
  });

  it("returns configured Access-Control-Allow-Origin even for a different request origin", async () => {
    const response = await request(app).get("/health").set("Origin", "http://malicious.local");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe(configuredOrigin);
  });

  it("returns preflight headers for an allowed origin", async () => {
    const response = await request(app)
      .options("/api/users")
      .set("Origin", configuredOrigin)
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "Content-Type,Authorization");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(configuredOrigin);
    expect(response.headers["access-control-allow-methods"]).toContain("POST");
  });
});
