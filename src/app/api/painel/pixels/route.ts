import { NextResponse } from "next/server";
import { query, run } from "@/lib/db";

export async function GET(request: Request) {
  const countResult = await query<{ count: string }>(`SELECT COUNT(*) as count FROM pixel_events`);
  const total = parseInt(countResult[0]?.count || "0");

  const rows = await query(`SELECT * FROM pixel_events ORDER BY created_at DESC`);

  return NextResponse.json({ data: rows, total });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, pixel_id_meta, pixel_id_google } = body;

    if (!name) {
      return NextResponse.json({ error: "Nome do evento é obrigatório" }, { status: 400 });
    }

    const result = await query<{ id: string }>(
      `INSERT INTO pixel_events (id, name, pixel_id_meta, pixel_id_google)
       VALUES (gen_random_uuid(), $1, $2, $3) RETURNING id`,
      [name, pixel_id_meta || null, pixel_id_google || null]
    );

    return NextResponse.json({ id: result[0].id }, { status: 201 });
  } catch (error) {
    console.error("Error creating pixel event:", error);
    return NextResponse.json({ error: "Erro ao criar evento de pixel" }, { status: 500 });
  }
}