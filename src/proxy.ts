import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger apenas rotas do painel admin
  if (pathname.startsWith("/painel") || pathname.startsWith("/api/painel")) {
    // Permitir rotas de autenticação
    if (pathname === "/login" || pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }

    const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

    if (!session) {
      // API: 401 JSON; páginas: redireciona para o login
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Headers com info do usuário (valores vindos do JWT assinado; os do cliente são sobrescritos)
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", session.userId);
    requestHeaders.set("x-user-email", session.email);
    requestHeaders.set("x-user-name", session.name || "");
    requestHeaders.set("x-user-role", session.role || "admin");

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/painel/:path*", "/api/painel/:path*"],
};