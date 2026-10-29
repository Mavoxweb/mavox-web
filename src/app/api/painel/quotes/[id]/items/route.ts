import { NextResponse } from "next/server";
import { query, run, queryOne } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const items = await query(
    `SELECT qi.*, s.name as "serviceName" 
     FROM quote_items qi 
     LEFT JOIN services s ON qi.service_id = s.id 
     WHERE qi.quote_id = $1 
     ORDER BY qi.position`,
    [id]
  );

  return NextResponse.json({ data: items });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { description, service_id, quantity = 1, unit_price = 0 } = body;

    if (!description) {
      return NextResponse.json({ error: "Descrição do item é obrigatória" }, { status: 400 });
    }

    const posResult = await queryOne<{ max_pos: number | null }>(
      `SELECT MAX(position) as max_pos FROM quote_items WHERE quote_id = $1`,
      [id]
    );
    const nextPosition = (posResult?.max_pos || 0) + 1;

    const result = await query<{ id: string }>(
      `INSERT INTO quote_items (id, quote_id, service_id, description, quantity, unit_price, position)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [id, service_id || null, description, quantity, unit_price, nextPosition]
    );

    // Recalcular total do orçamento
    await run(
      `UPDATE quotes 
       SET total = (SELECT COALESCE(SUM(quantity * unit_price), 0) FROM quote_items WHERE quote_id = $1),
           updated_at = now()
       WHERE id = $1`,
      [id]
    );

    return NextResponse.json({ id: result[0].id, success: true }, { status: 201 });
  } catch (error) {
    console.error("Erro ao adicionar item no orçamento:", error);
    return NextResponse.json({ error: "Erro ao adicionar item" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "itemId é obrigatório" }, { status: 400 });
    }

    await run(`DELETE FROM quote_items WHERE id = $1 AND quote_id = $2`, [itemId, id]);

    // Recalcular total do orçamento
    await run(
      `UPDATE quotes 
       SET total = (SELECT COALESCE(SUM(quantity * unit_price), 0) FROM quote_items WHERE quote_id = $1),
           updated_at = now()
       WHERE id = $1`,
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover item do orçamento:", error);
    return NextResponse.json({ error: "Erro ao remover item" }, { status: 500 });
  }
}
