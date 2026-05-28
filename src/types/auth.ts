export enum AuthRole {
  DRIVER = "driver",
  MECHANIC = "mechanic",
}

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

// Remplacer les guards complexes par des simples
export const isRefreshTokenPayload = (value: unknown): value is RefreshTokenPayload => {
  return (
      typeof value === "object" &&
      value !== null &&
      "tokenType" in value &&
      value.tokenType === "refresh"
  );
};

export const isAuthTokenPayload = (value: unknown): value is AuthTokenPayload => {
  return (
      typeof value === "object" &&
      value !== null &&
      "tokenType" in value &&
      value.tokenType === "access"
  );
};