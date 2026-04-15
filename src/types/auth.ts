export type AuthRole = "driver" | "mechanic";

export type AuthTokenPayload = {
  sub: string;
  role: AuthRole;
};

export const isAuthTokenPayload = (value: unknown): value is AuthTokenPayload => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Partial<AuthTokenPayload>;

  return (
    typeof payload.sub === "string" &&
    (payload.role === "driver" || payload.role === "mechanic")
  );
};
