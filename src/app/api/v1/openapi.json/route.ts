import { NextResponse } from "next/server";
import { QUOTE_STATUSES } from "@/lib/api-v1";

// Documentação pública (não expõe dados). Serve como "manual" para o bot descobrir as ações.
const idParam = { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } };
const pageParams = [
  { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
  { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
];
const json = (schema: unknown) => ({ required: true, content: { "application/json": { schema } } });
const ok = (description: string) => ({ description, content: { "application/json": { schema: { $ref: "#/components/schemas/Ok" } } } });
const errors = {
  "401": { description: "Chave ausente/inválida" },
  "403": { description: "Chave sem o escopo exigido" },
  "404": { description: "Não encontrado" },
  "422": { description: "Dados inválidos" },
};
const op = (scope: string, summary: string, extra: Record<string, unknown> = {}) => ({
  summary,
  description: `Escopo exigido: \`${scope}\``,
  security: [{ bearerAuth: [] }],
  responses: { "200": ok("Sucesso"), ...errors },
  ...extra,
});

export function GET() {
  const spec = {
    openapi: "3.0.3",
    info: {
      title: "Mavox API",
      version: "1.0.0",
      description:
        "API para integrações (bots/agentes). Autentique com `Authorization: Bearer mvx_...`. Respostas: `{ ok, data, pagination? }`; erros: `{ ok:false, error, details? }`. Valores monetários em reais (BRL). Datas em ISO 8601 com fuso.",
    },
    servers: [{ url: "/api/v1" }],
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer" } },
      schemas: {
        Ok: { type: "object", properties: { ok: { type: "boolean" }, data: {} } },
        QuoteItemInput: {
          type: "object",
          required: ["description"],
          properties: {
            description: { type: "string" },
            quantity: { type: "integer", default: 1 },
            unitPrice: { type: "number", default: 0 },
            serviceId: { type: "string", format: "uuid", nullable: true },
          },
        },
        ClientInput: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email", nullable: true },
            phone: { type: "string", nullable: true },
            company: { type: "string", nullable: true },
            source: { type: "string", default: "api" },
            intent: { type: "string", default: "conhecer" },
            notes: { type: "string", nullable: true },
          },
        },
      },
    },
    paths: {
      "/clients": {
        get: op("clients:read", "Lista clientes", {
          parameters: [...pageParams, { name: "search", in: "query", schema: { type: "string" } }, { name: "source", in: "query", schema: { type: "string" } }, { name: "intent", in: "query", schema: { type: "string" } }],
        }),
        post: op("clients:write", "Cria cliente", { requestBody: json({ $ref: "#/components/schemas/ClientInput" }), responses: { "201": ok("Criado"), ...errors, "409": { description: "Duplicado" } } }),
      },
      "/clients/{id}": {
        get: op("clients:read", "Detalhe do cliente (tags e últimos agendamentos)", { parameters: [idParam] }),
        patch: op("clients:write", "Atualiza campos do cliente (parcial)", { parameters: [idParam], requestBody: json({ type: "object", description: "Qualquer subconjunto dos campos de ClientInput, além de category, niche, city, state, website." }) }),
        post: op("clients:write", "Adiciona nota à linha do tempo do cliente", { parameters: [idParam], requestBody: json({ type: "object", required: ["description"], properties: { title: { type: "string" }, description: { type: "string" } } }), responses: { "201": ok("Criada"), ...errors } }),
      },
      "/quotes": {
        get: op("quotes:read", "Lista orçamentos", { parameters: [...pageParams, { name: "status", in: "query", schema: { type: "string", enum: QUOTE_STATUSES } }, { name: "search", in: "query", schema: { type: "string" } }] }),
        post: op("quotes:write", "Cria orçamento (informe clientId OU contact{name,email})", {
          requestBody: json({
            type: "object",
            properties: {
              clientId: { type: "string", format: "uuid" },
              contact: { type: "object", required: ["name", "email"], properties: { name: { type: "string" }, email: { type: "string" }, phone: { type: "string" }, company: { type: "string" } } },
              briefing: { type: "string" },
              budgetRange: { type: "string" },
              deadlinePref: { type: "string" },
              items: { type: "array", items: { $ref: "#/components/schemas/QuoteItemInput" } },
            },
          }),
          responses: { "201": ok("Criado: retorna id e code"), ...errors },
        }),
      },
      "/quotes/{id}": {
        get: op("quotes:read", "Detalhe do orçamento com itens, eventos e links das propostas", { parameters: [idParam] }),
        patch: op("quotes:write", "Muda o status do orçamento", { parameters: [idParam], requestBody: json({ type: "object", required: ["status"], properties: { status: { type: "string", enum: QUOTE_STATUSES }, note: { type: "string" } } }) }),
      },
      "/quotes/{id}/items": {
        post: op("quotes:write", "Adiciona item e recalcula o total", { parameters: [idParam], requestBody: json({ $ref: "#/components/schemas/QuoteItemInput" }), responses: { "201": ok("Criado"), ...errors } }),
      },
      "/appointments": {
        get: op("appointments:read", "Lista agendamentos", { parameters: [...pageParams, { name: "clientId", in: "query", schema: { type: "string", format: "uuid" } }, { name: "from", in: "query", schema: { type: "string", format: "date-time" } }, { name: "to", in: "query", schema: { type: "string", format: "date-time" } }] }),
        post: op("appointments:write", "Cria agendamento", { requestBody: json({ type: "object", required: ["title", "startsAt", "endsAt"], properties: { clientId: { type: "string", format: "uuid" }, title: { type: "string" }, startsAt: { type: "string", format: "date-time" }, endsAt: { type: "string", format: "date-time" }, meetLink: { type: "string", format: "uri" } } }), responses: { "201": ok("Criado"), ...errors } }),
      },
      "/appointments/{id}": {
        patch: op("appointments:write", "Atualiza agendamento (parcial)", { parameters: [idParam], requestBody: json({ type: "object", properties: { title: { type: "string" }, startsAt: { type: "string", format: "date-time" }, endsAt: { type: "string", format: "date-time" }, meetLink: { type: "string", nullable: true } } }) }),
        delete: op("appointments:write", "Remove agendamento", { parameters: [idParam] }),
      },
      "/followups": {
        get: op("followups:read", "Lista follow-ups registrados", { parameters: [...pageParams, { name: "quoteId", in: "query", schema: { type: "string", format: "uuid" } }] }),
        post: op("followups:write", "Registra follow-up num orçamento (não envia mensagem)", { requestBody: json({ type: "object", required: ["quoteId", "stage", "message"], properties: { quoteId: { type: "string", format: "uuid" }, stage: { type: "string" }, message: { type: "string" }, channel: { type: "string", enum: ["whatsapp", "email", "telefone", "outro"] } } }), responses: { "201": ok("Criado"), ...errors } }),
      },
    },
  };
  return NextResponse.json(spec, { headers: { "Cache-Control": "public, max-age=300" } });
}
