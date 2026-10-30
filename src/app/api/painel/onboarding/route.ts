import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rows = await query(
      `SELECT co.id, co.client_id, cl.name AS client_name, co.status, co.contract_value, co.quote_id FROM client_onboardings co JOIN clients cl ON cl.id = co.client_id ORDER BY co.created_at DESC LIMIT 50`
    );
    return NextResponse.json({ data: rows });
  } catch {
    return NextResponse.json({ data: [] }, { status: 500 });
  }
}
