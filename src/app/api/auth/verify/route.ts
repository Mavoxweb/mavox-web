import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export async function GET() {
  const cookieStore = await cookies();
  const user = await verifySession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!user) {
    return NextResponse.json({ ok: false, user: null }, { status: 401 });
  }
  return NextResponse.json({ ok: true, user });
}
