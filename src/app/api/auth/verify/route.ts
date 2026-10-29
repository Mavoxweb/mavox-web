import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookie = request.cookies.get("mavox_session");
  if (!cookie) {
    return NextResponse.json({ ok: false, user: null }, { status: 401 });
  }

  try {
    const user = JSON.parse(cookie.value);
    return NextResponse.json({ ok: true, user });
  } catch {
    return NextResponse.json({ ok: false, user: null }, { status: 401 });
  }
}