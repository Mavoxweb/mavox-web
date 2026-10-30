import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query(`
      SELECT
        fe.id,
        fe.rule_id,
        fe.lead_id,
        fe.quote_id,
        fe.status,
        fe.channel,
        fe.executed_at,
        fe.response_received,
        fe.created_at,
        fr.name as rule_name,
        c.name as lead_name,
        c.phone as lead_phone,
        q.code as quote_code
      FROM followup_executions fe
      LEFT JOIN followup_rules fr ON fr.id = fe.rule_id
      LEFT JOIN clients c ON c.id = fe.lead_id
      LEFT JOIN quotes q ON q.id = fe.quote_id
      ORDER BY fe.created_at DESC
      LIMIT 100
    `);
    return NextResponse.json({ data: rows });
  } catch {
    return NextResponse.json({ data: [] }, { status: 500 });
  }
}