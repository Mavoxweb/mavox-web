import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

const PUBLIC_PATHS = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir acesso livre à página de login
  if (pathname === "/login" || pathname.startsWith("/login/")) {
    return NextResponse.next();
  }

  // Proteger todas as rotas /painel/*
  if (pathname.startsWith("/painel")) {
    const session = request.cookies.get("mavox_session")?.value;
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // O cookie existe, usuário está autenticado
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/painel/:path*", "/login/:path*"],
};