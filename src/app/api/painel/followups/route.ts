import { NextResponse } from "next/server";
import { query, run, queryOne } from "@/lib/db";

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
    whereClause += ` AND f.stage = $${paramIndex}`;
    params.push(stage);
    paramIndex++;
  }

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM followups f ${whereClause}`,
    params
  );
  const total = parseInt(countResult[0]?.count || "0");

  params.push(limit, offset);
  const rows = await query(
    `SELECT f.*, q.code as "quoteCode", l.name as "clientName", l.phone as "clientPhone"
     FROM followups f
     LEFT JOIN quotes q ON f.quote_id = q.id
     LEFT JOIN leads l ON q.lead_id = l.id
     ${whereClause}
     ORDER BY f.stage, f.sent_at DESC NULLS LAST
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
    const { quote_id, stage, message, channel = "whatsapp" } = body;

    if (!quote_id || !stage || !message) {
      return NextResponse.json(
        { error: "quote_id, stage e message são obrigatórios" },
        { status: 400 }
      );
    }

    let resolvedQuoteId = quote_id.trim();

    // Se o valor informado não for um UUID padrão (36 chars), tenta buscar por código (ex: MVX-2026-0001)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resolvedQuoteId);
    if (!isUuid) {
      const found = await queryOne<{ id: string }>(
        `SELECT id FROM quotes WHERE code ILIKE $1 LIMIT 1`,
        [resolvedQuoteId]
      );
      if (!found) {
        return NextResponse.json(
          { error: `Nenhum orçamento encontrado com o código "${resolvedQuoteId}"` },
          { status: 404 }
        );
      }
      resolvedQuoteId = found.id;
    }

    const result = await query<{ id: string }>(
      `INSERT INTO followups (id, quote_id, stage, message, channel)
       VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING id`,
      [resolvedQuoteId, stage, message, channel]
    );

    return NextResponse.json({ id: result[0].id }, { status: 201 });
  } catch (error) {
    console.error("Error creating followup:", error);
    return NextResponse.json({ error: "Erro ao criar follow-up" }, { status: 500 });
  }
}
