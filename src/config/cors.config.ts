import type { CorsOptions } from "cors";

const DEFAULT_DEV_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:4173",
  "http://localhost:4200",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:4173",
  "http://127.0.0.1:4200",
  "http://127.0.0.1:5173",
];

const parseCommaSeparatedValues = (value: string) => {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const getAllowedOrigins = () => {
  const configuredOrigins = process.env.CORS_ALLOWED_ORIGINS?.trim();

  if (configuredOrigins) {
    return parseCommaSeparatedValues(configuredOrigins);
  }

  if (process.env.NODE_ENV === "production") {
    return [];
  }

  return DEFAULT_DEV_ORIGINS;
};

const getCorsCredentials = () => {
  return process.env.CORS_ALLOW_CREDENTIALS === "true";
};

export const getCorsOptions = (): CorsOptions => {
  const allowedOrigins = getAllowedOrigins();

  return {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      callback(null, allowedOrigins.includes(origin));
    },
    credentials: getCorsCredentials(),
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  };
};
