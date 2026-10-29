import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("mavox_session")?.value;
  if (!session) {
    return NextResponse.json({ ok: false, user: null }, { status: 401 });
  }

  try {
    const user = JSON.parse(session);
    return NextResponse.json({ ok: true, user });
  } catch {
    return NextResponse.json({ ok: false, user: null }, { status: 401 });
  }
}