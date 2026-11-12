import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApiKey, type ApiKeyRecord, type ApiScope } from "@/lib/api-keys";

export function apiError(status: number, error: string, details?: unknown) {
  return NextResponse.json({ ok: false, error, ...(details ? { details } : {}) }, { status });
}

type Ctx<P> = { params: Promise<P> };

/**
 * Envolve um handler exigindo chave de API com o escopo informado.
 * Erros inesperados viram 500 genérico (detalhe só no log do servidor).
 */
export function withApiKey<P = Record<string, never>>(
  scope: ApiScope,
  handler: (request: Request, ctx: { params: P; key: ApiKeyRecord }) => Promise<Response>
) {
  return async (request: Request, context: Ctx<P>): Promise<Response> => {
    const auth = await authenticateApiKey(request, scope);
    if (!auth.ok) return apiError(auth.status, auth.error);
    try {
      const params = (await context?.params) ?? ({} as P);
      return await handler(request, { params, key: auth.key });
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "23505") return apiError(409, "Registro duplicado (valor único já existe)");
      if (code === "23503") return apiError(422, "Referência inválida (registro relacionado não existe)");
      if (code === "22P02") return apiError(400, "Identificador ou valor em formato inválido");
      console.error(`[api/v1] erro (${scope}):`, err);
      return apiError(500, "Erro interno do servidor");
    }
  };
}

/** Lê e valida o corpo JSON. Retorna a resposta de erro pronta quando inválido. */
export async function parseBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<{ ok: true; data: z.infer<T> } | { ok: false; response: Response }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { ok: false, response: apiError(400, "Corpo da requisição não é um JSON válido") };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, response: apiError(422, "Dados inválidos", parsed.error.flatten().fieldErrors) };
  }
  return { ok: true, data: parsed.data };
}

export function parsePagination(url: URL): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10) || 20));
  return { page, limit, offset: (page - 1) * limit };
}

export function paginated<T>(data: T[], total: number, page: number, limit: number) {
  return NextResponse.json({
    ok: true,
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export const CLIENT_COLUMNS = `c.id, c.name, c.email, c.phone, c.phone_e164, c.company, c.source, c.intent,
  c.category, c.niche, c.city, c.state, c.website, c.notes, c.created_at, c.updated_at`;

export const QUOTE_STATUSES = ["novo", "em_analise", "proposta_enviada", "aprovado", "recusado", "expirado"] as const;

export const uuidSchema = z.string().uuid();

export function isUuid(value: string): boolean {
  return uuidSchema.safeParse(value).success;
}
