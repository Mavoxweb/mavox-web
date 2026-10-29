import { queryOne, run } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const reason = body.reason || "outro";
    const note = body.note || "";
    await run(
      `INSERT INTO lead_timeline (lead_id, type, title, description, metadata, created_by) VALUES ($1, 'lost_reason', $2, $3, $4, $5)`,
      [id, `Motivo de perda: ${reason}`, note || "", JSON.stringify({ reason }), "system"]
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao registrar perda." }, { status: 500 });
  }
}
