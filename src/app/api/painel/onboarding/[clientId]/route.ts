import { NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const row = (await queryOne(
    `SELECT * FROM client_onboardings WHERE client_id = $1`,
    [clientId]
  )) as { id: string } | null;
  if (!row) {
    return NextResponse.json({ found: false }, { status: 404 });
  }
  const stages = await query(
    `SELECT * FROM onboarding_stages WHERE onboarding_id = $1 ORDER BY order_num`,
    [row.id]
  );
  const payments = await query(
    `SELECT * FROM client_payments WHERE client_id = $1 ORDER BY due_date DESC LIMIT 20`,
    [clientId]
  );
  const timeline = await query(
    `SELECT * FROM lead_timeline WHERE lead_id = $1 ORDER BY created_at DESC LIMIT 20`,
    [clientId]
  );
  return NextResponse.json({ onboarding: row, stages, payments, timeline });
}
