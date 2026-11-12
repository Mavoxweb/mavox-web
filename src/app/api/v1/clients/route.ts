import { NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { normalizePhoneE164 } from "@/lib/lead-import";
import { CLIENT_COLUMNS, paginated, parseBody, parsePagination, withApiKey } from "@/lib/api-v1";

export const GET = withApiKey("clients:read", async (request) => {
  const url = new URL(request.url);
  const { page, limit, offset } = parsePagination(url);
  const search = url.searchParams.get("search") || "";
  const source = url.searchParams.get("source") || "";
  const intent = url.searchParams.get("intent") || "";

  const where: string[] = [];
  const params: unknown[] = [];
  if (search) {
    params.push(`%${search}%`);
    where.push(`(c.name ILIKE $${params.length} OR c.email ILIKE $${params.length} OR c.company ILIKE $${params.length} OR c.phone ILIKE $${params.length})`);
  }
  if (source) {
    params.push(source);
    where.push(`c.source = $${params.length}`);
  }
  if (intent) {
    params.push(intent);
    where.push(`c.intent = $${params.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [{ count }] = await query<{ count: string }>(`SELECT COUNT(*) AS count FROM clients c ${whereSql}`, params);
  const rows = await query(
    `SELECT ${CLIENT_COLUMNS} FROM clients c ${whereSql}
     ORDER BY c.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  return paginated(rows, parseInt(count, 10), page, limit);
});

const createSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(200).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  company: z.string().trim().max(200).optional().nullable(),
  source: z.string().trim().max(60).default("api"),
  intent: z.string().trim().max(60).default("conhecer"),
  notes: z.string().max(5000).optional().nullable(),
});

export const POST = withApiKey("clients:write", async (request) => {
  const body = await parseBody(request, createSchema);
  if (!body.ok) return body.response;
  const d = body.data;

  const rows = await query<{ id: string }>(
    `INSERT INTO clients (id, name, email, phone, phone_e164, company, source, intent, notes)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [d.name, d.email || null, d.phone || null, normalizePhoneE164(d.phone ?? undefined), d.company || null, d.source, d.intent, d.notes || null]
  );
  return NextResponse.json({ ok: true, data: { id: rows[0].id } }, { status: 201 });
});
