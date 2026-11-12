import { NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { API_SCOPES, generateApiKey } from "@/lib/api-keys";
import { apiError, isUuid, parseBody } from "@/lib/api-v1";

// Protegido pelo proxy (cookie de sessão). Aqui exigimos também papel de admin.
function requireAdmin(request: Request): Response | null {
  return request.headers.get("x-user-role") === "admin" ? null : apiError(403, "Apenas administradores");
}

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const rows = await query(
    `SELECT id, name, key_prefix, scopes, created_at, last_used_at, revoked_at FROM api_keys ORDER BY created_at DESC`
  );
  return NextResponse.json({ ok: true, data: rows, availableScopes: API_SCOPES });
}

const createSchema = z.object({
  name: z.string().trim().min(2).max(100),
  scopes: z.array(z.enum(API_SCOPES)).min(1),
});

/** Cria a chave. O valor completo é devolvido UMA vez e não pode ser recuperado depois. */
export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const body = await parseBody(request, createSchema);
  if (!body.ok) return body.response;

  const { key, prefix, hash } = generateApiKey();
  const rows = await query<{ id: string }>(
    `INSERT INTO api_keys (name, key_prefix, key_hash, scopes) VALUES ($1, $2, $3, $4) RETURNING id`,
    [body.data.name, prefix, hash, Array.from(new Set(body.data.scopes))]
  );
  return NextResponse.json({ ok: true, data: { id: rows[0].id, key, scopes: body.data.scopes } }, { status: 201 });
}

/** Revoga (não apaga) a chave: ?id=<uuid> */
export async function DELETE(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!isUuid(id)) return apiError(400, "id inválido");
  const rows = await query(`UPDATE api_keys SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL RETURNING id`, [id]);
  if (rows.length === 0) return apiError(404, "Chave não encontrada ou já revogada");
  return NextResponse.json({ ok: true });
}
