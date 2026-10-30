import { NextResponse } from "next/server";
import { query, queryOne, run } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query(
      `SELECT id, name, trigger_type, trigger_config, message_template, channel, active, created_at, updated_at
       FROM followup_rules ORDER BY created_at DESC`
    );
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("Erro ao buscar regras:", error);
    return NextResponse.json({ data: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, trigger_type, trigger_config, message_template, channel, active } = body;

    if (!name || !trigger_type || !message_template) {
      return NextResponse.json({ error: "Nome, tipo de gatilho e template são obrigatórios" }, { status: 400 });
    }

    const result = await queryOne<{ id: string }>(
      `INSERT INTO followup_rules (name, trigger_type, trigger_config, message_template, channel, active)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [name, trigger_type, JSON.stringify(trigger_config || {}), message_template, channel || "whatsapp", active !== false]
    );

    if (!result) {
      return NextResponse.json({ error: "Erro ao criar regra" }, { status: 500 });
    }

    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar regra:", error);
    return NextResponse.json({ error: "Erro ao criar regra" }, { status: 500 });
  }
}