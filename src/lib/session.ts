import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "mavox_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

export interface SessionUser {
  userId: string;
  email: string;
  name?: string;
  role?: string;
}

function getKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET ausente ou com menos de 32 caracteres");
    }
    return new TextEncoder().encode("mavox-dev-only-secret-not-for-production-use");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getKey());
}

/** Retorna o usuário da sessão ou null se o token for inválido/expirado/forjado. */
export async function verifySession(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ["HS256"] });
    if (typeof payload.userId !== "string" || typeof payload.email !== "string") return null;
    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name as string | undefined,
      role: payload.role as string | undefined,
    };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
