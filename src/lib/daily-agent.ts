import { query, queryOne, run } from "@/lib/db";
import { callOpenRouter, resolveModel } from "@/lib/ai";

interface AgentSettings {
  openrouter_api_key: string | null;
  ai_models: Record<string, string> | null;
  daily_agent_model: string | null;
  daily_agent_enabled: boolean | null;
}

export interface OpportunityCandidate {
  title: string;
  description: string;
  category: string;
  priority: "alta" | "media" | "baixa";
  related_type: string | null;
  related_id: string | null;
  action_url: string | null;
  action_label: string | null;
  source: "ai" | "regra";
}

export interface DailyAgentResult {
  inserted: number;
  usedAi: boolean;
  aiError?: string;
  candidates: number;
}

async function getAgentSettings(): Promise<AgentSettings> {
  try {
    const row = await queryOne<AgentSettings>(
      `SELECT openrouter_api_key, ai_models, daily_agent_model, daily_agent_enabled
       FROM settings WHERE id = 1`
    );
    return row ?? {
      openrouter_api_key: null,
      ai_models: null,
      daily_agent_model: null,
      daily_agent_enabled: true,
    };
  } catch {
    return {
      openrouter_api_key: process.env.OPENROUTER_API_KEY ?? null,
      ai_models: null,
      daily_agent_model: null,
      daily_agent_enabled: true,
    };
  }
}

function parseAiModels(value: unknown): Record<string, string> | null {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (typeof value === "object") return value as Record<string, string>;
  return null;
}

function money(value: unknown): string {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

async function buildCandidates(): Promise<OpportunityCandidate[]> {
  const candidates: OpportunityCandidate[] = [];

  const staleQuotes = await query<{
    id: string;
    code: string | null;
    name: string;
    created_at: string;
    total: string | null;
  }>(
    `SELECT q.id, q.code, l.name, q.created_at, q.total
     FROM quotes q
     JOIN leads l ON l.id = q.lead_id
     WHERE q.status IN ('novo', 'em_analise')
       AND q.created_at < now() - interval '2 days'
     ORDER BY q.created_at ASC
     LIMIT 8`
  );

  for (const quote of staleQuotes) {
    const days = Math.max(
      1,
      Math.floor((Date.now() - new Date(quote.created_at).getTime()) / 86400000)
    );
    candidates.push({
      title: `Orçamento ${quote.code ?? "sem código"} parado há ${days} dias`,
      description: `${quote.name} pediu orçamento há ${days} dias e ele ainda está em análise. Valor estimado: ${money(quote.total) || "não definido"}. Vale responder hoje.`,
      category: "orcamento",
      priority: days >= 5 ? "alta" : "media",
      related_type: "quote",
      related_id: quote.id,
      action_url: `/painel/quotes/${quote.id}`,
      action_label: "Abrir orçamento",
      source: "regra",
    });
  }

  const sentProposals = await query<{
    id: string;
    code: string | null;
    name: string;
    updated_at: string;
    viewed_at: string | null;
  }>(
    `SELECT q.id, q.code, l.name, q.updated_at, MAX(p.viewed_at) AS viewed_at
     FROM quotes q
     JOIN leads l ON l.id = q.lead_id
     LEFT JOIN proposals p ON p.quote_id = q.id
     WHERE q.status = 'proposta_enviada'
       AND q.updated_at < now() - interval '3 days'
     GROUP BY q.id, q.code, l.name, q.updated_at
     ORDER BY q.updated_at ASC
     LIMIT 8`
  );

  for (const quote of sentProposals) {
    const days = Math.max(
      1,
      Math.floor((Date.now() - new Date(quote.updated_at).getTime()) / 86400000)
    );
    const viewed = Boolean(quote.viewed_at);
    candidates.push({
      title: viewed
        ? `Proposta ${quote.code ?? ""} visualizada, sem resposta`
        : `Proposta ${quote.code ?? ""} enviada há ${days} dias`,
      description: viewed
        ? `${quote.name} abriu a proposta, mas não respondeu. É o melhor momento para um follow-up direto.`
        : `${quote.name} ainda não abriu a proposta enviada há ${days} dias. Considere reenviar por WhatsApp.`,
      category: "followup",
      priority: viewed ? "alta" : days >= 7 ? "alta" : "media",
      related_type: "quote",
      related_id: quote.id,
      action_url: `/painel/quotes/${quote.id}`,
      action_label: "Fazer follow-up",
      source: "regra",
    });
  }

  const idleClients = await query<{
    id: string;
    name: string;
    email: string | null;
    created_at: string;
  }>(
    `SELECT c.id, c.name, c.email, c.created_at
     FROM clients c
     LEFT JOIN leads l ON l.email = c.email
     LEFT JOIN quotes q ON q.lead_id = l.id
     WHERE q.id IS NULL
       AND c.created_at < now() - interval '3 days'
     ORDER BY c.created_at ASC
     LIMIT 8`
  );

  for (const client of idleClients) {
    const days = Math.max(
      1,
      Math.floor((Date.now() - new Date(client.created_at).getTime()) / 86400000)
    );
    candidates.push({
      title: `Cliente ${client.name} sem orçamento`,
      description: `${client.name} entrou na base há ${days} dias e ainda não tem orçamento vinculado. Faça uma abordagem de reengajamento.`,
      category: "cliente",
      priority: days >= 14 ? "alta" : "baixa",
      related_type: "client",
      related_id: client.id,
      action_url: `/painel/clients/${client.id}`,
      action_label: "Ver cliente",
      source: "regra",
    });
  }

  const meetings = await query<{
    id: string;
    title: string;
    starts_at: string;
    name: string | null;
  }>(
    `SELECT a.id, a.title, a.starts_at, c.name
     FROM appointments a
     LEFT JOIN clients c ON c.id = a.client_id
     WHERE a.starts_at BETWEEN now() AND now() + interval '2 days'
     ORDER BY a.starts_at ASC
     LIMIT 8`
  );

  for (const meeting of meetings) {
    const when = new Date(meeting.starts_at).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
    candidates.push({
      title: `Reunião próxima: ${meeting.title}`,
      description: `${meeting.name ? `Com ${meeting.name}` : "Compromisso"} em ${when}. Revise o briefing e prepare a pauta.`,
      category: "reuniao",
      priority: "alta",
      related_type: "appointment",
      related_id: meeting.id,
      action_url: "/painel/appointments",
      action_label: "Ver agenda",
      source: "regra",
    });
  }

  const pendingFollowups = await query<{
    id: string;
    quote_id: string | null;
    stage: string;
    message: string;
    created_at: string;
    name: string | null;
  }>(
    `SELECT f.id, f.quote_id, f.stage, f.message, f.created_at, l.name
     FROM followups f
     LEFT JOIN quotes q ON q.id = f.quote_id
     LEFT JOIN leads l ON l.id = q.lead_id
     WHERE f.sent_at IS NULL
       AND f.created_at < now() - interval '1 day'
     ORDER BY f.created_at ASC
     LIMIT 8`
  );

  for (const followup of pendingFollowups) {
    const days = Math.max(
      1,
      Math.floor((Date.now() - new Date(followup.created_at).getTime()) / 86400000)
    );
    candidates.push({
      title: `Follow-up pendente há ${days} dia(s)`,
      description: `${followup.name ? `Para ${followup.name}: ` : ""}“${followup.message.slice(
        0,
        140
      )}” ainda não foi enviado (etapa: ${followup.stage}). Envie agora para não perder o timing.`,
      category: "followup",
      priority: days >= 3 ? "alta" : "media",
      related_type: followup.quote_id ? "quote" : null,
      related_id: followup.quote_id,
      action_url: followup.quote_id ? `/painel/quotes/${followup.quote_id}` : "/painel/followups",
      action_label: "Enviar follow-up",
      source: "regra",
    });
  }

  const emailFailures = await query<{
    template_key: string | null;
    total: number;
    last_error: string | null;
  }>(
    `SELECT template_key, COUNT(*)::int AS total, MAX(error) AS last_error
     FROM email_logs
     WHERE status = 'error'
       AND created_at > now() - interval '24 hours'
     GROUP BY template_key
     ORDER BY COUNT(*) DESC
     LIMIT 5`
  );

  for (const failure of emailFailures) {
    const total = Number(failure.total) || 0;
    candidates.push({
      title: `${total} falha(s) de envio de e-mail nas últimas 24h`,
      description: `Template “${failure.template_key || "avulso"}” acumulou ${total} erro(s). Último erro: ${
        failure.last_error?.slice(0, 160) || "desconhecido"
      }. Revise SMTP e reenvie.`,
      category: "geral",
      priority: total >= 3 ? "alta" : "media",
      related_type: null,
      related_id: null,
      action_url: "/painel/settings",
      action_label: "Revisar SMTP",
      source: "regra",
    });
  }

  return candidates.slice(0, 12);
}

interface AiRefinement {
  index: number;
  title?: string;
  description?: string;
  priority?: "alta" | "media" | "baixa";
}

function parseAiRefinements(content: string): AiRefinement[] {
  const cleaned = content
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as
      | { opportunities?: AiRefinement[] }
      | AiRefinement[];
    const list = Array.isArray(parsed) ? parsed : parsed.opportunities;
    if (!Array.isArray(list)) return [];
    return list.filter((item) => Number.isInteger(item?.index));
  } catch {
    return [];
  }
}

async function refineWithAi(
  settings: AgentSettings,
  candidates: OpportunityCandidate[]
): Promise<{ candidates: OpportunityCandidate[]; usedAi: boolean; aiError?: string }> {
  if (!settings.openrouter_api_key || candidates.length === 0) {
    return { candidates, usedAi: false };
  }

  const aiModels = parseAiModels(settings.ai_models);
  const model = resolveModel(aiModels, "daily_agent", settings.daily_agent_model);

  const snapshot = candidates.map((candidate, index) => ({
    index,
    titulo: candidate.title,
    descricao: candidate.description,
    categoria: candidate.category,
    prioridade: candidate.priority,
    tipo_relacionado: candidate.related_type,
  }));

  const result = await callOpenRouter({
    apiKey: settings.openrouter_api_key,
    model,
    temperature: 0.35,
    maxTokens: 1600,
    jsonMode: true,
    messages: [
      {
        role: "system",
        content:
          "Você é o agente diário comercial da MAVOX, agência de desenvolvimento web. " +
          "Recebe uma lista de oportunidades detectadas por regras e deve reescrever título, descrição e prioridade " +
          "para maximizar clareza e ação. Responda SOMENTE JSON válido no formato " +
          '{"opportunities":[{"index":0,"title":"...","description":"...","priority":"alta|media|baixa"}]}. ' +
          "Mantenha todos os índices recebidos, sem inventar novos. Português do Brasil, tom direto e específico.",
      },
      {
        role: "user",
        content: JSON.stringify({ oportunidades: snapshot }),
      },
    ],
  });

  if (!result.ok || !result.content) {
    return { candidates, usedAi: false, aiError: result.error };
  }

  const refinements = parseAiRefinements(result.content);
  if (refinements.length === 0) {
    return {
      candidates,
      usedAi: false,
      aiError: "A IA respondeu em formato inesperado; mantidos os textos das regras.",
    };
  }

  const byIndex = new Map(refinements.map((item) => [item.index, item]));
  const refined = candidates.map((candidate, index) => {
    const item = byIndex.get(index);
    if (!item) return candidate;
    return {
      ...candidate,
      title: item.title?.trim() || candidate.title,
      description: item.description?.trim() || candidate.description,
      priority:
        item.priority === "alta" || item.priority === "media" || item.priority === "baixa"
          ? item.priority
          : candidate.priority,
      source: "ai" as const,
    };
  });

  return { candidates: refined, usedAi: true };
}

export async function runDailyAgent(): Promise<DailyAgentResult> {
  const settings = await getAgentSettings();

  if (settings.daily_agent_enabled === false) {
    return { inserted: 0, usedAi: false, candidates: 0, aiError: "Agente diário desativado." };
  }

  const candidates = await buildCandidates();
  const refined = await refineWithAi(settings, candidates);

  await run(`DELETE FROM ai_opportunities WHERE run_date = CURRENT_DATE`);

  for (const item of refined.candidates) {
    await run(
      `INSERT INTO ai_opportunities
         (run_date, title, description, category, priority, related_type, related_id,
          action_url, action_label, source, status)
       VALUES (CURRENT_DATE, $1, $2, $3, $4, $5, $6, $7, $8, $9, 'aberta')`,
      [
        item.title,
        item.description,
        item.category,
        item.priority,
        item.related_type,
        item.related_id,
        item.action_url,
        item.action_label,
        item.source,
      ]
    );
  }

  try {
    await run(`UPDATE settings SET daily_agent_last_run = now() WHERE id = 1`);
  } catch {
    // coluna pode não existir antes da migração
  }

  return {
    inserted: refined.candidates.length,
    usedAi: refined.usedAi,
    candidates: candidates.length,
    aiError: refined.aiError,
  };
}
