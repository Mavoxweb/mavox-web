import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query(`SELECT id, rule_id, lead_id, quote_id, status, channel, executed_at, response_received, created_at FROM followup_executions ORDER BY created_at DESC LIMIT 50`);
    return NextResponse.json({ data: rows });
  } catch {
    return NextResponse.json({ data: [] }, { status: 500 });
  }
}
