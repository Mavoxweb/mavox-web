import { NextResponse } from "next/server";
import { query, run } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stage = searchParams.get("stage") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const offset = (page - 1) * limit;

  let whereClause = "WHERE 1=1";
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (stage) {
    whereClause += ` AND stage = $${paramIndex}`;
    params.push(stage);
    paramIndex++;
  }

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM followups ${whereClause}`,
    params
  );
  const total = parseInt(countResult[0]?.count || "0");

  params.push(limit, offset);
  const rows = await query(
    `SELECT * FROM followups ${whereClause} ORDER BY stage, created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    params
  );

  return NextResponse.json({
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quote_id, stage, message, channel = "whatsapp" } = body;

    if (!quote_id || !stage || !message) {
      return NextResponse.json({ error: "quote_id, stage e message são obrigatórios" }, { status: 400 });
    }

    const result = await query<{ id: string }>(
      `INSERT INTO followups (id, quote_id, stage, message, channel)
       VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING id`,
      [quote_id, stage, message, channel]
    );

    return NextResponse.json({ id: result[0].id }, { status: 201 });
  } catch (error) {
    console.error("Error creating followup:", error);
    return NextResponse.json({ error: "Erro ao criar follow-up" }, { status: 500 });
  }
}