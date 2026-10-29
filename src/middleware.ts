import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || "mavox-dev-secret-change-in-production-min-32-chars"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger apenas rotas do painel admin
  if (pathname.startsWith("/painel") || pathname.startsWith("/api/painel")) {
    // Permitir rotas de autenticação
    if (pathname === "/login" || pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }

    const sessionCookie = request.cookies.get("mavox_session")?.value;

    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verificar se o cookie é um JSON válido
      let session: { userId: string; email: string; name?: string; role?: string };
      try {
        session = JSON.parse(sessionCookie);
      } catch {
        // Se não for JSON, tentar decodificar como JWT
        const { payload } = await jwtVerify(sessionCookie, SECRET_KEY);
        session = {
          userId: payload.userId as string,
          email: payload.email as string,
          name: payload.name as string | undefined,
          role: payload.role as string | undefined,
        };
      }

      // Adicionar headers com info do usuário para uso nos Server Components
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", session.userId);
      requestHeaders.set("x-user-email", session.email);
      requestHeaders.set("x-user-name", session.name || "");
      requestHeaders.set("x-user-role", session.role || "admin");

      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch (err) {
      console.error("Erro na verificação de sessão:", err);
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/painel/:path*", "/api/painel/:path*"],
};