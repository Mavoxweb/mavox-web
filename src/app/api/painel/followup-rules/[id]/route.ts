import { NextResponse } from "next/server";
import { queryOne, run } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rule = await queryOne(
      `SELECT id, name, trigger_type, trigger_config, message_template, channel, active, created_at, updated_at
       FROM followup_rules WHERE id = $1`,
      [id]
    );
    if (!rule) return NextResponse.json({ error: "Regra não encontrada" }, { status: 404 });
    return NextResponse.json({ data: rule });
  } catch (error) {
    console.error("Erro ao buscar regra:", error);
    return NextResponse.json({ error: "Erro ao buscar regra" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, trigger_type, trigger_config, message_template, channel, active } = body;

    const existing = await queryOne(`SELECT id FROM followup_rules WHERE id = $1`, [id]);
    if (!existing) return NextResponse.json({ error: "Regra não encontrada" }, { status: 404 });

    await run(
      `UPDATE followup_rules SET
         name = $1, trigger_type = $2, trigger_config = $3, message_template = $4, channel = $5, active = $6, updated_at = NOW()
       WHERE id = $7`,
      [name, trigger_type, JSON.stringify(trigger_config || {}), message_template, channel || "whatsapp", active !== false, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar regra:", error);
    return NextResponse.json({ error: "Erro ao atualizar regra" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await queryOne(`SELECT id FROM followup_rules WHERE id = $1`, [id]);
    if (!existing) return NextResponse.json({ error: "Regra não encontrada" }, { status: 404 });

    await run(`DELETE FROM followup_rules WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir regra:", error);
    return NextResponse.json({ error: "Erro ao excluir regra" }, { status: 500 });
  }
}