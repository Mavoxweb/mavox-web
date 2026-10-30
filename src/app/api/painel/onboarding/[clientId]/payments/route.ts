import { query, queryOne, run } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const rows = await query(
    `SELECT id, amount, status, due_date, paid_at, payment_method, interest_applied, notes FROM client_payments WHERE client_id = $1 ORDER BY due_date DESC LIMIT 30`,
    [clientId]
  );
  return NextResponse.json({ data: rows });
}

export async function POST(request: Request, { params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  try {
    const body = await request.json();
    const insert = await query<{ id: string }>(
      `INSERT INTO client_payments (client_id, due_date, amount, status, payment_method, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [clientId, body.due_date || null, body.amount || 0, body.status || "pending", body.payment_method || "", body.notes || ""]
    );
    return NextResponse.json({ ok: true, id: insert[0]?.id });
  } catch {
    return NextResponse.json({ error: "Erro ao criar pagamento." }, { status: 500 });
  }
}
