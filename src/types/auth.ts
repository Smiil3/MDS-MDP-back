export type AuthRole = "driver" | "mechanic";

export type AuthTokenPayload = {
  sub: string;
  role: AuthRole;
  tokenType: "access";
};

export type RefreshTokenPayload = {
  sub: string;
  role: AuthRole;
  tokenType: "refresh";
};

const hasValidBasePayload = (
  value: unknown,
): value is { sub: string; role: AuthRole; tokenType: string } => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Partial<AuthTokenPayload | RefreshTokenPayload>;

  return (
    typeof payload.sub === "string" &&
    (payload.role === "driver" || payload.role === "mechanic") &&
    typeof payload.tokenType === "string"
  );
};

export const isAuthTokenPayload = (value: unknown): value is AuthTokenPayload => {
  return hasValidBasePayload(value) && value.tokenType === "access";
};

export const isRefreshTokenPayload = (
  value: unknown,
): value is RefreshTokenPayload => {
  return hasValidBasePayload(value) && value.tokenType === "refresh";
};
