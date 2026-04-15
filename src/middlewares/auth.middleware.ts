import { type NextFunction, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/auth.config";
import type { AuthRole } from "../types/auth";
import { isAuthTokenPayload } from "../types/auth";

const extractBearerToken = (authorizationHeader?: string) => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

export const authMiddleware =
  (allowedRoles?: AuthRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      res.status(401).json({ message: "Missing or invalid Bearer token." });
      return;
    }

    jwt.verify(token, getJwtSecret(), (error, decoded) => {
      if (error) {
        res.status(401).json({ message: "Invalid or expired token." });
        return;
      }

      if (!isAuthTokenPayload(decoded)) {
        res.status(401).json({ message: "Invalid token payload." });
        return;
      }

      if (allowedRoles && !allowedRoles.includes(decoded.role)) {
        res.status(403).json({ message: "Forbidden for this role." });
        return;
      }

      req.authUser = decoded;
      next();
    });
  };
