import { NextResponse } from "next/server";
import { query, run } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const clientId = searchParams.get("clientId") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  const offset = (page - 1) * limit;

  let whereClause = "WHERE 1=1";
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (clientId) {
    whereClause += ` AND a.client_id = $${paramIndex}`;
    params.push(clientId);
    paramIndex++;
  }

  if (startDate) {
    whereClause += ` AND a.starts_at >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    whereClause += ` AND a.starts_at <= $${paramIndex}`;
    params.push(endDate);
    paramIndex++;
  }

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM appointments a ${whereClause}`,
    params
  );
  const total = parseInt(countResult[0]?.count || "0");

  params.push(limit, offset);
  const rows = await query(
    `SELECT a.*, c.name as "clientName", c.email as "clientEmail"
     FROM appointments a
     LEFT JOIN clients c ON a.client_id = c.id
     ${whereClause}
     ORDER BY a.starts_at ASC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
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
    const { clientId, title, startsAt, endsAt, meetLink } = body;

    if (!title || !startsAt || !endsAt) {
      return NextResponse.json({ error: "Título, início e fim são obrigatórios" }, { status: 400 });
    }

    const result = await query<{ id: string }>(
      `INSERT INTO appointments (id, client_id, title, starts_at, ends_at, meet_link)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5) RETURNING id`,
      [clientId || null, title, startsAt, endsAt, meetLink || null]
    );

    return NextResponse.json({ id: result[0].id }, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: "Erro ao criar agendamento" }, { status: 500 });
  }
}