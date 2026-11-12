import { NextResponse } from "next/server";
import { z } from "zod";
import { query, queryOne, withTransaction } from "@/lib/db";
import { apiError, paginated, parseBody, parsePagination, QUOTE_STATUSES, withApiKey } from "@/lib/api-v1";

export const GET = withApiKey("quotes:read", async (request) => {
  const url = new URL(request.url);
  const { page, limit, offset } = parsePagination(url);
  const status = url.searchParams.get("status") || "";
  const search = url.searchParams.get("search") || "";

  const where: string[] = [];
  const params: unknown[] = [];
  if (status) {
    if (!(QUOTE_STATUSES as readonly string[]).includes(status)) {
      return apiError(400, `status inválido. Use: ${QUOTE_STATUSES.join(", ")}`);
    }
    params.push(status);
    where.push(`q.status = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    where.push(`(q.code ILIKE $${params.length} OR l.name ILIKE $${params.length} OR l.email ILIKE $${params.length})`);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [{ count }] = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM quotes q JOIN leads l ON l.id = q.lead_id ${whereSql}`,
    params
  );
  const rows = await query(
    `SELECT q.id, q.code, q.status, q.total, q.briefing, q.budget_range, q.deadline_pref, q.valid_until,
            q.created_at, q.updated_at, l.name AS "contactName", l.email AS "contactEmail", l.phone AS "contactPhone"
     FROM quotes q JOIN leads l ON l.id = q.lead_id
     ${whereSql}
     ORDER BY q.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  return paginated(rows, parseInt(count, 10), page, limit);
});

const itemSchema = z.object({
  description: z.string().trim().min(1).max(500),
  quantity: z.number().int().min(1).max(10000).default(1),
  unitPrice: z.number().min(0).max(100_000_000).default(0),
  serviceId: z.string().uuid().optional().nullable(),
});

const createSchema = z
  .object({
    // Informe um cliente existente OU os dados do contato (o orçamento é ligado a um "lead" com e-mail).
    clientId: z.string().uuid().optional(),
    contact: z
      .object({
        name: z.string().trim().min(1).max(200),
        email: z.string().trim().email().max(200),
        phone: z.string().trim().max(40).optional().nullable(),
        company: z.string().trim().max(200).optional().nullable(),
      })
      .optional(),
    briefing: z.string().max(5000).optional().nullable(),
    budgetRange: z.string().max(100).optional().nullable(),
    deadlinePref: z.string().max(100).optional().nullable(),
    items: z.array(itemSchema).max(100).default([]),
  })
  .refine((v) => v.clientId || v.contact, { message: "Informe clientId ou contact" });

function generateCode(): string {
  const year = new Date().getFullYear();
  return `MVX-${year}-${String(Math.floor(1000 + Math.random() * 8999)).padStart(4, "0")}`;
}

export const POST = withApiKey("quotes:write", async (request) => {
  const body = await parseBody(request, createSchema);
  if (!body.ok) return body.response;
  const d = body.data;

  let contact = d.contact;
  if (d.clientId) {
    const client = await queryOne<{ name: string; email: string | null; phone: string | null; company: string | null }>(
      `SELECT name, email, phone, company FROM clients WHERE id = $1`,
      [d.clientId]
    );
    if (!client) return apiError(404, "Cliente não encontrado");
    if (!client.email) return apiError(422, "O cliente não tem e-mail; envie 'contact' com um e-mail para criar o orçamento");
    contact = { name: client.name, email: client.email, phone: client.phone, company: client.company };
  }
  if (!contact) return apiError(422, "Informe clientId ou contact");
  const c = contact;

  const total = d.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const result = await withTransaction(async (tx) => {
    const lead = await tx.query<{ id: string }>(
      `INSERT INTO leads (id, name, email, phone, company, source) VALUES (gen_random_uuid(), $1, $2, $3, $4, 'api') RETURNING id`,
      [c.name, c.email, c.phone || null, c.company || null]
    );
    const code = generateCode();
    const quote = await tx.query<{ id: string }>(
      `INSERT INTO quotes (id, code, lead_id, status, briefing, budget_range, deadline_pref, total, valid_until)
       VALUES (gen_random_uuid(), $1, $2, 'novo', $3, $4, $5, $6, CURRENT_DATE + INTERVAL '30 days') RETURNING id`,
      [code, lead.rows[0].id, d.briefing || null, d.budgetRange || null, d.deadlinePref || null, total]
    );
    const quoteId = quote.rows[0].id;
    for (let i = 0; i < d.items.length; i++) {
      const it = d.items[i];
      await tx.query(
        `INSERT INTO quote_items (id, quote_id, service_id, description, quantity, unit_price, position)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)`,
        [quoteId, it.serviceId || null, it.description, it.quantity, it.unitPrice, i + 1]
      );
    }
    await tx.query(
      `INSERT INTO quote_events (id, quote_id, type, data) VALUES (gen_random_uuid(), $1, 'status_change', $2)`,
      [quoteId, JSON.stringify({ status: "novo", previous: null, origin: "api" })]
    );
    return { id: quoteId, code };
  });

  return NextResponse.json({ ok: true, data: result }, { status: 201 });
});
