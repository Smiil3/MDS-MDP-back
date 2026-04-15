import request from "supertest";
import { app } from "../../src/app";

describe("cors middleware (component)", () => {
  const allowedOrigin = "http://localhost:5173";

  it("adds Access-Control-Allow-Origin for an allowed origin", async () => {
    const response = await request(app).get("/health").set("Origin", allowedOrigin);

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe(allowedOrigin);
  });

  it("does not add Access-Control-Allow-Origin for a disallowed origin", async () => {
    const response = await request(app).get("/health").set("Origin", "http://malicious.local");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("returns preflight headers for an allowed origin", async () => {
    const response = await request(app)
      .options("/api/users")
      .set("Origin", allowedOrigin)
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "Content-Type,Authorization");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(allowedOrigin);
    expect(response.headers["access-control-allow-methods"]).toContain("POST");
  });
});
