import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, getAuthCookieName } from "@/lib/auth";

export const runtime = "nodejs";

const PUBLIC_PATHS = ["/painel/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/painel")) {
    const token = request.cookies.get(getAuthCookieName())?.value;
    if (!token) {
      const loginUrl = new URL("/painel/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const user = await verifyToken(token);
    if (!user) {
      const response = NextResponse.redirect(new URL("/painel/login", request.url));
      response.cookies.delete(getAuthCookieName());
      return response;
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", user.sub);
    requestHeaders.set("x-user-email", user.email);
    requestHeaders.set("x-user-role", user.role ?? "user");

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/painel/:path*"],
};