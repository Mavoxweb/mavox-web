import { NextResponse } from "next/server";
import { z } from "zod";
import { query, queryOne } from "@/lib/db";
import { apiError, paginated, parseBody, parsePagination, withApiKey } from "@/lib/api-v1";

const dateParam = z.string().datetime({ offset: true });

export const GET = withApiKey("appointments:read", async (request) => {
  const url = new URL(request.url);
  const { page, limit, offset } = parsePagination(url);
  const clientId = url.searchParams.get("clientId") || "";
  const from = url.searchParams.get("from") || "";
  const to = url.searchParams.get("to") || "";

  const where: string[] = [];
  const params: unknown[] = [];
  if (clientId) {
    if (!z.string().uuid().safeParse(clientId).success) return apiError(400, "clientId inválido");
    params.push(clientId);
    where.push(`a.client_id = $${params.length}`);
  }
  for (const [name, value, op] of [["from", from, ">="], ["to", to, "<="]] as const) {
    if (!value) continue;
    if (!dateParam.safeParse(value).success) return apiError(400, `${name} deve ser data ISO 8601 (ex.: 2026-11-20T09:00:00-03:00)`);
    params.push(value);
    where.push(`a.starts_at ${op} $${params.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [{ count }] = await query<{ count: string }>(`SELECT COUNT(*) AS count FROM appointments a ${whereSql}`, params);
  const rows = await query(
    `SELECT a.id, a.client_id, a.title, a.starts_at, a.ends_at, a.meet_link, a.created_at, c.name AS "clientName"
     FROM appointments a LEFT JOIN clients c ON c.id = a.client_id
     ${whereSql} ORDER BY a.starts_at ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  return paginated(rows, parseInt(count, 10), page, limit);
});

const createSchema = z
  .object({
    clientId: z.string().uuid().optional().nullable(),
    title: z.string().trim().min(1).max(200),
    startsAt: dateParam,
    endsAt: dateParam,
    meetLink: z.string().url().max(500).optional().nullable(),
  })
  .refine((v) => new Date(v.endsAt) > new Date(v.startsAt), { message: "endsAt deve ser depois de startsAt", path: ["endsAt"] });

export const POST = withApiKey("appointments:write", async (request) => {
  const body = await parseBody(request, createSchema);
  if (!body.ok) return body.response;
  const d = body.data;

  if (d.clientId) {
    const exists = await queryOne(`SELECT 1 FROM clients WHERE id = $1`, [d.clientId]);
    if (!exists) return apiError(404, "Cliente não encontrado");
  }
  const rows = await query<{ id: string }>(
    `INSERT INTO appointments (id, client_id, title, starts_at, ends_at, meet_link)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5) RETURNING id`,
    [d.clientId || null, d.title, d.startsAt, d.endsAt, d.meetLink || null]
  );
  return NextResponse.json({ ok: true, data: { id: rows[0].id } }, { status: 201 });
});
