import { NextResponse } from "next/server";
import { z } from "zod";
import { queryOne, withTransaction } from "@/lib/db";
import { apiError, isUuid, parseBody, withApiKey } from "@/lib/api-v1";

type P = { id: string };

const itemSchema = z.object({
  description: z.string().trim().min(1).max(500),
  quantity: z.number().int().min(1).max(10000).default(1),
  unitPrice: z.number().min(0).max(100_000_000).default(0),
  serviceId: z.string().uuid().optional().nullable(),
});

/** Adiciona um item ao orçamento e recalcula o total. */
export const POST = withApiKey<P>("quotes:write", async (request, { params }) => {
  if (!isUuid(params.id)) return apiError(400, "ID inválido");
  const body = await parseBody(request, itemSchema);
  if (!body.ok) return body.response;
  const it = body.data;

  const exists = await queryOne(`SELECT 1 FROM quotes WHERE id = $1`, [params.id]);
  if (!exists) return apiError(404, "Orçamento não encontrado");

  const result = await withTransaction(async (tx) => {
    const pos = await tx.query<{ next: number }>(
      `SELECT COALESCE(MAX(position), 0) + 1 AS next FROM quote_items WHERE quote_id = $1`,
      [params.id]
    );
    const inserted = await tx.query<{ id: string }>(
      `INSERT INTO quote_items (id, quote_id, service_id, description, quantity, unit_price, position)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6) RETURNING id`,
      [params.id, it.serviceId || null, it.description, it.quantity, it.unitPrice, pos.rows[0].next]
    );
    const total = await tx.query<{ total: string }>(
      `UPDATE quotes SET total = (SELECT COALESCE(SUM(quantity * COALESCE(unit_price, 0)), 0) FROM quote_items WHERE quote_id = $1),
              updated_at = now()
       WHERE id = $1 RETURNING total`,
      [params.id]
    );
    return { id: inserted.rows[0].id, quoteTotal: Number(total.rows[0].total) };
  });
  return NextResponse.json({ ok: true, data: result }, { status: 201 });
});
