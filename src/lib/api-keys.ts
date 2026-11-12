import { createHash, randomBytes } from "node:crypto";
import { queryOne, run } from "@/lib/db";

export const API_SCOPES = [
  "clients:read",
  "clients:write",
  "quotes:read",
  "quotes:write",
  "appointments:read",
  "appointments:write",
  "followups:read",
  "followups:write",
] as const;
export type ApiScope = (typeof API_SCOPES)[number];

export interface ApiKeyRecord {
  id: string;
  name: string;
  scopes: string[];
}

const KEY_PREFIX = "mvx_";

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/** Gera uma chave nova. `key` só existe neste momento; no banco vai apenas o hash. */
export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const key = `${KEY_PREFIX}${randomBytes(32).toString("base64url")}`;
  return { key, prefix: key.slice(0, 12), hash: hashApiKey(key) };
}

export type AuthResult =
  | { ok: true; key: ApiKeyRecord }
  | { ok: false; status: 401 | 403; error: string };

/** Valida `Authorization: Bearer mvx_...` e se a chave tem o escopo exigido. Falha fechado. */
export async function authenticateApiKey(request: Request, scope: ApiScope): Promise<AuthResult> {
  const header = request.headers.get("authorization") || "";
  const match = /^Bearer\s+(\S+)$/i.exec(header);
  if (!match || !match[1].startsWith(KEY_PREFIX)) {
    return { ok: false, status: 401, error: "Chave de API ausente ou inválida" };
  }

  const row = await queryOne<ApiKeyRecord>(
    `SELECT id, name, scopes FROM api_keys WHERE key_hash = $1 AND revoked_at IS NULL`,
    [hashApiKey(match[1])]
  );
  if (!row) return { ok: false, status: 401, error: "Chave de API ausente ou inválida" };

  if (!row.scopes.includes(scope)) {
    return { ok: false, status: 403, error: `Chave sem permissão para este recurso (requer ${scope})` };
  }

  // Atualização de last_used_at é só informativa: não deve derrubar a requisição.
  run(`UPDATE api_keys SET last_used_at = now() WHERE id = $1`, [row.id]).catch(() => {});
  return { ok: true, key: row };
}
