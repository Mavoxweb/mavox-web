import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

export interface AuthUser extends JWTPayload {
  sub: string;
  email: string;
  name?: string;
  role?: string;
  emailVerified?: boolean;
}

let JWKS: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS() {
  if (JWKS) return JWKS;
  const jwksUrl = process.env.NEON_AUTH_JWKS_URL;
  if (!jwksUrl) {
    throw new Error("NEON_AUTH_JWKS_URL não está configurada");
  }
  JWKS = createRemoteJWKSet(new URL(jwksUrl));
  return JWKS;
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJWKS(), {
      issuer: process.env.NEON_AUTH_BASE_URL,
    });
    return payload as unknown as AuthUser;
  } catch {
    return null;
  }
}

// signIn NÃO precisa verificar o token via JWKS — o Neon Auth já retorna um token válido.
// A verificação server-side é feita pelo middleware.
export async function signIn(email: string, password: string): Promise<{ token: string; user: Partial<AuthUser> } | null> {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!baseUrl) return null;

  const res = await fetch(`${baseUrl}/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: siteUrl || "" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.token ? { token: data.token, user: data.user || {} } : null;
}

export async function signUp(email: string, password: string, name: string): Promise<{ token: string; user: Partial<AuthUser> } | null> {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!baseUrl) return null;

  const res = await fetch(`${baseUrl}/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: siteUrl || "" },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.token ? { token: data.token, user: data.user || {} } : null;
}

export function getAuthCookieName(): string {
  return "neon_auth_session";
}