import { NextResponse } from "next/server";
import { z } from "zod";
import { query, queryOne, run } from "@/lib/db";
import { normalizePhoneE164 } from "@/lib/lead-import";
import { apiError, CLIENT_COLUMNS, isUuid, parseBody, withApiKey } from "@/lib/api-v1";

type P = { id: string };

export const GET = withApiKey<P>("clients:read", async (_req, { params }) => {
  if (!isUuid(params.id)) return apiError(400, "ID inválido");
  const client = await queryOne(`SELECT ${CLIENT_COLUMNS} FROM clients c WHERE c.id = $1`, [params.id]);
  if (!client) return apiError(404, "Cliente não encontrado");

  const [tags, appointments] = await Promise.all([
    query(
      `SELECT t.id, t.name, t.color FROM client_tags ct JOIN tags t ON t.id = ct.tag_id WHERE ct.client_id = $1`,
      [params.id]
    ),
    query(
      `SELECT id, title, starts_at, ends_at, meet_link FROM appointments
       WHERE client_id = $1 ORDER BY starts_at DESC LIMIT 10`,
      [params.id]
    ),
  ]);
  return NextResponse.json({ ok: true, data: { ...client, tags, appointments } });
});

const patchSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    email: z.string().trim().email().max(200).nullable(),
    phone: z.string().trim().max(40).nullable(),
    company: z.string().trim().max(200).nullable(),
    source: z.string().trim().max(60),
    intent: z.string().trim().max(60),
    notes: z.string().max(5000).nullable(),
    category: z.string().trim().max(120).nullable(),
    niche: z.string().trim().max(120).nullable(),
    city: z.string().trim().max(120).nullable(),
    state: z.string().trim().max(60).nullable(),
    website: z.string().trim().max(300).nullable(),
  })
  .partial()
  .strict();

/** Atualização parcial: só os campos enviados são alterados. */
export const PATCH = withApiKey<P>("clients:write", async (request, { params }) => {
  if (!isUuid(params.id)) return apiError(400, "ID inválido");
  const body = await parseBody(request, patchSchema);
  if (!body.ok) return body.response;

  const entries = Object.entries(body.data).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return apiError(422, "Nenhum campo para atualizar");

  const sets: string[] = [];
  const values: unknown[] = [];
  for (const [column, value] of entries) {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
    if (column === "phone") {
      values.push(normalizePhoneE164(value as string | null));
      sets.push(`phone_e164 = $${values.length}`);
    }
  }
  values.push(params.id);

  const updated = await query<{ id: string }>(
    `UPDATE clients SET ${sets.join(", ")}, updated_at = now() WHERE id = $${values.length} RETURNING id`,
    values
  );
  if (updated.length === 0) return apiError(404, "Cliente não encontrado");
  return NextResponse.json({ ok: true, data: { id: params.id } });
});

/** Adiciona uma nota à linha do tempo do cliente (não altera o cadastro). */
const noteSchema = z.object({ title: z.string().trim().max(200).optional(), description: z.string().trim().min(1).max(5000) });

export const POST = withApiKey<P>("clients:write", async (request, { params }) => {
  if (!isUuid(params.id)) return apiError(400, "ID inválido");
  const body = await parseBody(request, noteSchema);
  if (!body.ok) return body.response;

  const exists = await queryOne(`SELECT 1 FROM clients WHERE id = $1`, [params.id]);
  if (!exists) return apiError(404, "Cliente não encontrado");

  await run(
    `INSERT INTO lead_timeline (id, lead_id, type, title, description, metadata)
     VALUES (gen_random_uuid(), $1, 'nota', $2, $3, '{"origin":"api"}'::jsonb)`,
    [params.id, body.data.title || "Nota (API)", body.data.description]
  );
  return NextResponse.json({ ok: true }, { status: 201 });
});
