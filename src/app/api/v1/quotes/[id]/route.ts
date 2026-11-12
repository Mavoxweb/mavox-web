import { NextResponse } from "next/server";
import { z } from "zod";
import { query, queryOne, run } from "@/lib/db";
import { apiError, isUuid, parseBody, QUOTE_STATUSES, withApiKey } from "@/lib/api-v1";

type P = { id: string };

export const GET = withApiKey<P>("quotes:read", async (_req, { params }) => {
  if (!isUuid(params.id)) return apiError(400, "ID inválido");

  const quote = await queryOne(
    `SELECT q.id, q.code, q.status, q.total, q.briefing, q.budget_range, q.deadline_pref, q.valid_until,
            q.created_at, q.updated_at, l.name AS "contactName", l.email AS "contactEmail",
            l.phone AS "contactPhone", l.company AS "contactCompany"
     FROM quotes q JOIN leads l ON l.id = q.lead_id WHERE q.id = $1`,
    [params.id]
  );
  if (!quote) return apiError(404, "Orçamento não encontrado");

  const [items, events, proposals] = await Promise.all([
    query(
      `SELECT qi.id, qi.description, qi.quantity, qi.unit_price, qi.position, s.name AS "serviceName"
       FROM quote_items qi LEFT JOIN services s ON s.id = qi.service_id
       WHERE qi.quote_id = $1 ORDER BY qi.position`,
      [params.id]
    ),
    query(`SELECT id, type, data, created_at FROM quote_events WHERE quote_id = $1 ORDER BY created_at DESC LIMIT 50`, [params.id]),
    query<{ public_token: string }>(
      `SELECT id, version, public_token, sent_at, viewed_at, accepted_at FROM proposals WHERE quote_id = $1 ORDER BY version DESC`,
      [params.id]
    ),
  ]);

  const base = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const withLinks = proposals.map((p) => ({ ...p, url: base ? `${base}/proposta/${p.public_token}` : `/proposta/${p.public_token}` }));
  return NextResponse.json({ ok: true, data: { ...quote, items, events, proposals: withLinks } });
});

const patchSchema = z
  .object({
    status: z.enum(QUOTE_STATUSES),
    note: z.string().max(1000).optional(),
  })
  .strict();

/** Muda o status do orçamento e registra o evento na linha do tempo. */
export const PATCH = withApiKey<P>("quotes:write", async (request, { params }) => {
  if (!isUuid(params.id)) return apiError(400, "ID inválido");
  const body = await parseBody(request, patchSchema);
  if (!body.ok) return body.response;

  const current = await queryOne<{ status: string }>(`SELECT status FROM quotes WHERE id = $1`, [params.id]);
  if (!current) return apiError(404, "Orçamento não encontrado");

  if (current.status !== body.data.status) {
    await run(`UPDATE quotes SET status = $1, updated_at = now() WHERE id = $2`, [body.data.status, params.id]);
    await run(
      `INSERT INTO quote_events (id, quote_id, type, data) VALUES (gen_random_uuid(), $1, 'status_change', $2)`,
      [params.id, JSON.stringify({ status: body.data.status, previous: current.status, origin: "api", note: body.data.note ?? null })]
    );
  }
  return NextResponse.json({ ok: true, data: { id: params.id, status: body.data.status } });
});
