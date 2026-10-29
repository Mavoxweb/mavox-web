import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  const offset = (page - 1) * limit;

  const countResult = await query<{ count: string }>(`SELECT COUNT(*) as count FROM tags`);
  const total = parseInt(countResult[0]?.count || "0");

  const rows = await query(
    `SELECT * FROM tags ORDER BY name LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return NextResponse.json({
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, color } = body;

    if (!name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const result = await query<{ id: string }>(
      `INSERT INTO tags (id, name, color) VALUES (gen_random_uuid(), $1, $2) RETURNING id`,
      [name, color || "#3b82f6"]
    );

    return NextResponse.json({ id: result[0].id }, { status: 201 });
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json({ error: "Erro ao criar tag" }, { status: 500 });
  }
}