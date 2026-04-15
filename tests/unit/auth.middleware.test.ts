import jwt from "jsonwebtoken";
import { type NextFunction, type Request, type Response } from "express";
import { authMiddleware } from "../../src/middlewares/auth.middleware";

type ResponseMock = Response & {
  status: jest.Mock;
  json: jest.Mock;
};

const createResponse = (): ResponseMock => {
  const res = {} as ResponseMock;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("auth.middleware", () => {
  const secret = "middleware-secret";

  beforeEach(() => {
    process.env.JWT_SECRET = secret;
    jest.clearAllMocks();
  });

  it("returns 401 when bearer token is missing", () => {
    const req = { headers: {} } as Request;
    const res = createResponse();
    const next = jest.fn() as NextFunction;

    authMiddleware()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 when role is not allowed", () => {
    const token = jwt.sign({ sub: "1", role: "driver" }, secret, {
      expiresIn: "1h",
    });
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as Request;
    const res = createResponse();
    const next = jest.fn() as NextFunction;

    authMiddleware(["mechanic"])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("sets req.authUser and calls next for a valid token", () => {
    const token = jwt.sign({ sub: "2", role: "mechanic" }, secret, {
      expiresIn: "1h",
    });
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as Request;
    const res = createResponse();
    const next = jest.fn() as NextFunction;

    authMiddleware(["mechanic"])(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.authUser).toMatchObject({ sub: "2", role: "mechanic" });
  });
});
