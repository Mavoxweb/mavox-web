import { NextResponse } from "next/server";
import { query, run } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";

  const offset = (page - 1) * limit;

  let whereClause = "WHERE 1=1";
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (status) {
    whereClause += ` AND q.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (search) {
    whereClause += ` AND (q.code ILIKE $${paramIndex} OR l.name ILIKE $${paramIndex} OR l.email ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM quotes q JOIN leads l ON q.lead_id = l.id ${whereClause}`,
    params
  );
  const total = parseInt(countResult[0]?.count || "0");

  params.push(limit, offset);
  const rows = await query(
    `SELECT q.*, l.name as "clientName", l.email as "clientEmail", l.phone as "clientPhone"
     FROM quotes q
     JOIN leads l ON q.lead_id = l.id
     ${whereClause}
     ORDER BY q.created_at DESC
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
    const { leadId, status = "novo", briefing, budgetRange, deadlinePref, items } = body;

    if (!leadId) {
      return NextResponse.json({ error: "leadId é obrigatório" }, { status: 400 });
    }

    const year = new Date().getFullYear();
    const code = `MVX-${year}-${String(Math.floor(1000 + Math.random() * 8999)).padStart(4, "0")}`;

    const quoteResult = await query<{ id: string }>(
      `INSERT INTO quotes (id, code, lead_id, status, briefing, budget_range, deadline_pref, total, valid_until)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 0, CURRENT_DATE + INTERVAL '30 days')
       RETURNING id`,
      [code, leadId, status, briefing || null, budgetRange || null, deadlinePref || null]
    );
    const quoteId = quoteResult[0].id;

    if (items && items.length > 0) {
      let total = 0;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const unitPrice = item.unitPrice || 0;
        const quantity = item.quantity || 1;
        total += unitPrice * quantity;

        await run(
          `INSERT INTO quote_items (id, quote_id, service_id, description, quantity, unit_price, position)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)`,
          [quoteId, item.serviceId || null, item.description, quantity, unitPrice, i + 1]
        );
      }

      await run(`UPDATE quotes SET total = $1 WHERE id = $2`, [total, quoteId]);
    }

    await run(
      `INSERT INTO quote_events (id, quote_id, type, data) VALUES (gen_random_uuid(), $1, $2, $3)`,
      [quoteId, "status_change", JSON.stringify({ status, previous: "novo" })]
    );

    return NextResponse.json({ id: quoteId, code }, { status: 201 });
  } catch (error) {
    console.error("Error creating quote:", error);
    return NextResponse.json({ error: "Erro ao criar orçamento" }, { status: 500 });
  }
}