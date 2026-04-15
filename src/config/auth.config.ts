import type { SignOptions } from "jsonwebtoken";

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return secret;
};

export const getJwtExpiresIn = (): SignOptions["expiresIn"] => {
  const expiresIn = process.env.JWT_EXPIRES_IN;

  return expiresIn ? (expiresIn as SignOptions["expiresIn"]) : "1h";
};

export const getJwtRefreshSecret = () => {
  return process.env.JWT_REFRESH_SECRET || getJwtSecret();
};

export const getJwtRefreshExpiresIn = (): SignOptions["expiresIn"] => {
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN;

  return expiresIn ? (expiresIn as SignOptions["expiresIn"]) : "7d";
};
