import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

const NEON_AUTH_JWKS_URL = process.env.NEON_AUTH_JWKS_URL!;
const NEON_AUTH_BASE_URL = process.env.NEON_AUTH_BASE_URL!;

const JWKS = createRemoteJWKSet(new URL(NEON_AUTH_JWKS_URL));

export interface AuthUser extends JWTPayload {
  sub: string;
  email: string;
  name?: string;
  role?: string;
  emailVerified?: boolean;
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: NEON_AUTH_BASE_URL,
    });
    return payload as unknown as AuthUser;
  } catch {
    return null;
  }
}

export async function signIn(email: string, password: string): Promise<{ token: string; user: AuthUser } | null> {
  const res = await fetch(`${NEON_AUTH_BASE_URL}/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: process.env.NEXT_PUBLIC_SITE_URL! },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const user = await verifyToken(data.token);
  return user ? { token: data.token, user } : null;
}

export async function signUp(email: string, password: string, name: string): Promise<{ token: string; user: AuthUser } | null> {
  const res = await fetch(`${NEON_AUTH_BASE_URL}/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: process.env.NEXT_PUBLIC_SITE_URL! },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const user = await verifyToken(data.token);
  return user ? { token: data.token, user } : null;
}

export function getAuthCookieName(): string {
  return "neon_auth_session";
}