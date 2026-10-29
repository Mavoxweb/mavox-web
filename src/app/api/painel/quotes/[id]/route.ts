import { NextResponse } from "next/server";
import { query, queryOne, run } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const quote = await queryOne(
    `SELECT q.*, l.name as "clientName", l.email as "clientEmail", l.phone as "clientPhone", l.company as "clientCompany"
     FROM quotes q
     JOIN leads l ON q.lead_id = l.id
     WHERE q.id = $1`,
    [id]
  );

  if (!quote) {
    return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 });
  }

  const items = await query(
    `SELECT qi.*, s.name as "serviceName", s.slug as "serviceSlug"
     FROM quote_items qi
     LEFT JOIN services s ON qi.service_id = s.id
     WHERE qi.quote_id = $1
     ORDER BY qi.position`,
    [id]
  );

  const events = await query(
    `SELECT * FROM quote_events WHERE quote_id = $1 ORDER BY created_at DESC`,
    [id]
  );

  return NextResponse.json({ ...quote, items, events });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { status, items, total } = body;

    const oldQuote = await queryOne<{ status: string }>(`SELECT status FROM quotes WHERE id = $1`, [id]);
    if (!oldQuote) {
      return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 });
    }

    const updates: string[] = [];
    const values: (string | number)[] = [];
    let paramIndex = 1;

    if (status && status !== oldQuote.status) {
      updates.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;

      await run(
        `INSERT INTO quote_events (id, quote_id, type, data) VALUES (gen_random_uuid(), $1, $2, $3)`,
        [id, "status_change", JSON.stringify({ status, previous: oldQuote.status })]
      );
    }

    if (total !== undefined) {
      updates.push(`total = $${paramIndex}`);
      values.push(total);
      paramIndex++;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    if (updates.length > 1) {
      values.push(id);
      await run(
        `UPDATE quotes SET ${updates.join(", ")} WHERE id = $${paramIndex}`,
        values
      );
    }

    if (items) {
      await run(`DELETE FROM quote_items WHERE quote_id = $1`, [id]);
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await run(
          `INSERT INTO quote_items (id, quote_id, service_id, description, quantity, unit_price, position)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)`,
          [id, item.serviceId || null, item.description, item.quantity || 1, item.unitPrice || 0, i + 1]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating quote:", error);
    return NextResponse.json({ error: "Erro ao atualizar orçamento" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await run(`DELETE FROM quotes WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting quote:", error);
    return NextResponse.json({ error: "Erro ao excluir orçamento" }, { status: 500 });
  }
}