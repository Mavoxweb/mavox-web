import { NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { apiError, isUuid, parseBody, withApiKey } from "@/lib/api-v1";

type P = { id: string };

const dateParam = z.string().datetime({ offset: true });
const patchSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    startsAt: dateParam,
    endsAt: dateParam,
    meetLink: z.string().url().max(500).nullable(),
  })
  .partial()
  .strict();

const COLUMN: Record<string, string> = { title: "title", startsAt: "starts_at", endsAt: "ends_at", meetLink: "meet_link" };

export const PATCH = withApiKey<P>("appointments:write", async (request, { params }) => {
  if (!isUuid(params.id)) return apiError(400, "ID inválido");
  const body = await parseBody(request, patchSchema);
  if (!body.ok) return body.response;

  const entries = Object.entries(body.data).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return apiError(422, "Nenhum campo para atualizar");

  const sets = entries.map(([key], i) => `${COLUMN[key]} = $${i + 1}`);
  const values: unknown[] = [...entries.map(([, v]) => v), params.id];
  // Falha no CHECK/consistência de datas fica a cargo do banco; garantimos aqui o caso comum.
  const updated = await query<{ id: string; starts_at: string; ends_at: string }>(
    `UPDATE appointments SET ${sets.join(", ")} WHERE id = $${values.length} RETURNING id, starts_at, ends_at`,
    values
  );
  if (updated.length === 0) return apiError(404, "Agendamento não encontrado");
  if (new Date(updated[0].ends_at) <= new Date(updated[0].starts_at)) {
    return apiError(422, "endsAt deve ser depois de startsAt (verifique os valores atuais do agendamento)");
  }
  return NextResponse.json({ ok: true, data: { id: params.id } });
});

export const DELETE = withApiKey<P>("appointments:write", async (_req, { params }) => {
  if (!isUuid(params.id)) return apiError(400, "ID inválido");
  const deleted = await query<{ id: string }>(`DELETE FROM appointments WHERE id = $1 RETURNING id`, [params.id]);
  if (deleted.length === 0) return apiError(404, "Agendamento não encontrado");
  return NextResponse.json({ ok: true });
});
