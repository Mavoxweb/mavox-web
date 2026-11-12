import { NextResponse } from "next/server";
import { z } from "zod";
import { query, queryOne } from "@/lib/db";
import { apiError, paginated, parseBody, parsePagination, withApiKey } from "@/lib/api-v1";

/** Lista follow-ups registrados por orçamento (e as regras ativas de automação). */
export const GET = withApiKey("followups:read", async (request) => {
  const url = new URL(request.url);
  const { page, limit, offset } = parsePagination(url);
  const quoteId = url.searchParams.get("quoteId") || "";

  const params: unknown[] = [];
  let whereSql = "";
  if (quoteId) {
    if (!z.string().uuid().safeParse(quoteId).success) return apiError(400, "quoteId inválido");
    params.push(quoteId);
    whereSql = `WHERE f.quote_id = $1`;
  }

  const [{ count }] = await query<{ count: string }>(`SELECT COUNT(*) AS count FROM followups f ${whereSql}`, params);
  const rows = await query(
    `SELECT f.id, f.quote_id, q.code AS "quoteCode", f.stage, f.message, f.channel, f.sent_at, f.created_at
     FROM followups f LEFT JOIN quotes q ON q.id = f.quote_id
     ${whereSql} ORDER BY f.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  return paginated(rows, parseInt(count, 10), page, limit);
});

const createSchema = z.object({
  quoteId: z.string().uuid(),
  stage: z.string().trim().min(1).max(60),
  message: z.string().trim().min(1).max(5000),
  channel: z.enum(["whatsapp", "email", "telefone", "outro"]).default("whatsapp"),
});

/**
 * REGISTRA um follow-up no orçamento (histórico/lembrete). Não envia mensagem:
 * o envio continua sendo feito pelas regras/cron do sistema ou pelo próprio bot.
 */
export const POST = withApiKey("followups:write", async (request) => {
  const body = await parseBody(request, createSchema);
  if (!body.ok) return body.response;
  const d = body.data;

  const exists = await queryOne(`SELECT 1 FROM quotes WHERE id = $1`, [d.quoteId]);
  if (!exists) return apiError(404, "Orçamento não encontrado");

  const rows = await query<{ id: string }>(
    `INSERT INTO followups (id, quote_id, stage, message, channel) VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING id`,
    [d.quoteId, d.stage, d.message, d.channel]
  );
  return NextResponse.json({ ok: true, data: { id: rows[0].id } }, { status: 201 });
});
