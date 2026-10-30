import { query, queryOne, run } from "@/lib/db";
import type { NextRequest } from "next/server";

interface FollowupRule {
  id: string;
  name: string;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  message_template: string;
  channel: string;
}

async function getRules(): Promise<FollowupRule[]> {
  const rows = await query<FollowupRule>(
    `SELECT id, name, trigger_type, trigger_config, message_template, channel
     FROM followup_rules WHERE active = true`
  );
  return rows.map(r => ({
    ...r,
    trigger_config: typeof r.trigger_config === "string" ? JSON.parse(r.trigger_config) : (r.trigger_config || {}),
  }));
}

async function getLeadByQuoteId(quoteId: string): Promise<{ id: string; name: string; phone: string | null; email: string | null } | null> {
  return queryOne(
    `SELECT c.id, c.name, c.phone, c.email
     FROM quotes q JOIN clients c ON c.id = q.client_id
     WHERE q.id = $1`,
    [quoteId]
  );
}

async function hasRecentExecution(ruleId: string, quoteId: string | null, leadId: string | null, days: number): Promise<boolean> {
  const interval = `${days} days`;
  const res = await queryOne(
    `SELECT 1 FROM followup_executions
     WHERE rule_id = $1
       AND (quote_id = $2 OR lead_id = $3)
       AND created_at > NOW() - INTERVAL '${interval}'
     LIMIT 1`,
    [ruleId, quoteId, leadId]
  );
  return !!res;
}

async function createExecution(ruleId: string, leadId: string | null, quoteId: string | null, channel: string): Promise<void> {
  await run(
    `INSERT INTO followup_executions (rule_id, lead_id, quote_id, status, channel)
     VALUES ($1, $2, $3, 'pending', $4)
     ON CONFLICT DO NOTHING`,
    [ruleId, leadId, quoteId, channel]
  );
}

async function addTimelineEvent(leadId: string, type: string, title: string, description: string, metadata: Record<string, unknown> = {}): Promise<void> {
  await run(
    `INSERT INTO lead_timeline (lead_id, type, title, description, metadata, created_by)
     VALUES ($1, $2, $3, $4, $5, 'system')`,
    [leadId, type, title, description, JSON.stringify(metadata)]
  );
}

function generateWhatsAppLink(phone: string | null, message: string): string | null {
  if (!phone) return null;
  const clean = phone.replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

async function processNoResponse(rule: FollowupRule): Promise<number> {
  const config = rule.trigger_config;
  const days = (config.days as number) || 2;
  const minViewed = config.min_viewed === true;

  const quotes = await query<{ id: string; viewed_at: string | null; client_id: string }>(
    `SELECT q.id, q.viewed_at, q.client_id
     FROM quotes q
     WHERE q.status = 'proposta_enviada'
       AND q.updated_at < NOW() - INTERVAL '${days} days'
       ${minViewed ? "AND q.viewed_at IS NOT NULL" : ""}
     LIMIT 20`
  );

  let count = 0;
  for (const q of quotes) {
    if (await hasRecentExecution(rule.id, q.id, null, days)) continue;
    await createExecution(rule.id, q.client_id, q.id, rule.channel);
    const lead = await getLeadByQuoteId(q.id);
    const link = lead ? generateWhatsAppLink(lead.phone, rule.message_template) : null;
    if (link) {
      await addTimelineEvent(q.client_id, "whatsapp_sent", `Follow-up: ${rule.name}`, `Enviado via WhatsApp: ${rule.message_template}`, { quote_id: q.id, rule_id: rule.id, whatsapp_link: link });
    }
    count++;
  }
  return count;
}

async function processStageStale(rule: FollowupRule): Promise<number> {
  const config = rule.trigger_config;
  const days = (config.days as number) || 10;
  const stage = (config.stage as string) || "proposta_enviada";

  const quotes = await query<{ id: string; client_id: string }>(
    `SELECT q.id, q.client_id FROM quotes q WHERE q.status = $1 AND q.updated_at < NOW() - INTERVAL '${days} days' LIMIT 20`,
    [stage]
  );

  let count = 0;
  for (const q of quotes) {
    if (await hasRecentExecution(rule.id, q.id, null, days)) continue;
    await createExecution(rule.id, q.client_id, q.id, rule.channel);
    const lead = await getLeadByQuoteId(q.id);
    const link = lead ? generateWhatsAppLink(lead.phone, rule.message_template) : null;
    if (link) {
      await addTimelineEvent(q.client_id, "whatsapp_sent", `Follow-up: ${rule.name}`, `Enviado via WhatsApp: ${rule.message_template}`, { quote_id: q.id, rule_id: rule.id, whatsapp_link: link });
    }
    count++;
  }
  return count;
}

async function processContractPending(rule: FollowupRule): Promise<number> {
  const config = rule.trigger_config;
  const days = (config.days as number) || 3;
  const status = (config.status as string) || "aprovado";

  const quotes = await query<{ id: string; client_id: string }>(
    `SELECT q.id, q.client_id FROM quotes q WHERE q.status = $1 AND q.updated_at < NOW() - INTERVAL '${days} days' LIMIT 20`,
    [status]
  );

  let count = 0;
  for (const q of quotes) {
    if (await hasRecentExecution(rule.id, q.id, null, days)) continue;
    await createExecution(rule.id, q.client_id, q.id, rule.channel);
    const lead = await getLeadByQuoteId(q.id);
    const link = lead ? generateWhatsAppLink(lead.phone, rule.message_template) : null;
    if (link) {
      await addTimelineEvent(q.client_id, "whatsapp_sent", `Follow-up: ${rule.name}`, `Enviado via WhatsApp: ${rule.message_template}`, { quote_id: q.id, rule_id: rule.id, whatsapp_link: link });
    }
    count++;
  }
  return count;
}

async function processMeetingNeeded(rule: FollowupRule): Promise<number> {
  const config = rule.trigger_config;
  const days = (config.days as number) || 7;
  const stage = (config.stage as string) || "avaliando";

  const quotes = await query<{ id: string; client_id: string }>(
    `SELECT q.id, q.client_id FROM quotes q WHERE q.status = $1 AND q.updated_at < NOW() - INTERVAL '${days} days' LIMIT 20`,
    [stage]
  );

  let count = 0;
  for (const q of quotes) {
    if (await hasRecentExecution(rule.id, q.id, null, days)) continue;
    await createExecution(rule.id, q.client_id, q.id, rule.channel);
    const lead = await getLeadByQuoteId(q.id);
    const link = lead ? generateWhatsAppLink(lead.phone, rule.message_template) : null;
    if (link) {
      await addTimelineEvent(q.client_id, "whatsapp_sent", `Follow-up: ${rule.name}`, `Enviado via WhatsApp: ${rule.message_template}`, { quote_id: q.id, rule_id: rule.id, whatsapp_link: link });
    }
    count++;
  }
  return count;
}

async function processReEngage(rule: FollowupRule): Promise<number> {
  const config = rule.trigger_config;
  const days = (config.days as number) || 90;
  const status = config.status as string | undefined;
  const lostReason = config.lost_reason as string | undefined;

  let clients: { id: string; name: string; phone: string | null; email: string | null }[] = [];

  if (status) {
    const quotes = await query<{ client_id: string }>(
      `SELECT DISTINCT q.client_id FROM quotes q WHERE q.status = $1 AND q.updated_at < NOW() - INTERVAL '${days} days'`,
      [status]
    );
    for (const q of quotes) {
      const lead = await getLeadByQuoteId(q.client_id);
      if (lead) clients.push(lead);
    }
  }

  if (lostReason) {
    // Buscar leads com motivo de perda específico via timeline
    const leads = await query<{ lead_id: string }>(
      `SELECT DISTINCT lt.lead_id FROM lead_timeline lt
       WHERE lt.type = 'lost_reason'
         AND lt.metadata->>'reason' = $1
         AND lt.created_at < NOW() - INTERVAL '${days} days'`,
      [lostReason]
    );
    for (const l of leads) {
      const lead = await queryOne<{ id: string; name: string; phone: string | null; email: string | null }>(
        `SELECT id, name, phone, email FROM clients WHERE id = $1`,
        [l.lead_id]
      );
      if (lead) clients.push(lead);
    }
  }

  // Dedupe
  const uniqueClients = Array.from(new Map(clients.map(c => [c.id, c])).values());

  let count = 0;
  for (const lead of uniqueClients.slice(0, 20)) {
    if (await hasRecentExecution(rule.id, null, lead.id, days)) continue;
    await createExecution(rule.id, lead.id, null, rule.channel);
    const link = generateWhatsAppLink(lead.phone, rule.message_template);
    if (link) {
      await addTimelineEvent(lead.id, "whatsapp_sent", `Re-engajamento: ${rule.name}`, `Enviado via WhatsApp: ${rule.message_template}`, { rule_id: rule.id, whatsapp_link: link });
    }
    count++;
  }
  return count;
}

async function processRuleById(ruleId: string): Promise<number> {
  const rule = await queryOne<FollowupRule>(
    `SELECT id, name, trigger_type, trigger_config, message_template, channel
     FROM followup_rules WHERE id = $1 AND active = true`,
    [ruleId]
  );
  if (!rule) return 0;

  const parsedRule: FollowupRule = {
    ...rule,
    trigger_config: typeof rule.trigger_config === "string" ? JSON.parse(rule.trigger_config) : (rule.trigger_config || {}),
  };

  let count = 0;
  try {
    switch (parsedRule.trigger_type) {
      case "no_response":
        count = await processNoResponse(parsedRule);
        break;
      case "stage_stale":
        count = await processStageStale(parsedRule);
        break;
      case "contract_pending":
        count = await processContractPending(parsedRule);
        break;
      case "meeting_needed":
        count = await processMeetingNeeded(parsedRule);
        break;
      case "re_engage":
        count = await processReEngage(parsedRule);
        break;
    }
  } catch (err) {
    console.error(`Erro na regra ${parsedRule.name}:`, err);
  }
  return count;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || req.nextUrl.searchParams.get("token");
  if (auth !== process.env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401 });
  }

  const rules = await getRules();
  const results: Record<string, number> = {};

  for (const rule of rules) {
    let count = 0;
    try {
      switch (rule.trigger_type) {
        case "no_response":
          count = await processNoResponse(rule);
          break;
        case "stage_stale":
          count = await processStageStale(rule);
          break;
        case "contract_pending":
          count = await processContractPending(rule);
          break;
        case "meeting_needed":
          count = await processMeetingNeeded(rule);
          break;
        case "re_engage":
          count = await processReEngage(rule);
          break;
      }
    } catch (err) {
      console.error(`Erro na regra ${rule.name}:`, err);
    }
    results[rule.name] = count;
  }

  return new Response(
    JSON.stringify({ ok: true, rules_processed: rules.length, executions_created: results }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || req.nextUrl.searchParams.get("token");
  if (auth !== process.env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401 });
  }

  try {
    const body = await req.json();
    const { trigger_rule_id } = body;

    if (trigger_rule_id) {
      const count = await processRuleById(trigger_rule_id);
      return new Response(
        JSON.stringify({ ok: true, rule_id: trigger_rule_id, executions_created: count }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Se não passou trigger_rule_id, executa todas (comportamento original do GET)
    const rules = await getRules();
    const results: Record<string, number> = {};

    for (const rule of rules) {
      let count = 0;
      try {
        switch (rule.trigger_type) {
          case "no_response":
            count = await processNoResponse(rule);
            break;
          case "stage_stale":
            count = await processStageStale(rule);
            break;
          case "contract_pending":
            count = await processContractPending(rule);
            break;
          case "meeting_needed":
            count = await processMeetingNeeded(rule);
            break;
          case "re_engage":
            count = await processReEngage(rule);
            break;
        }
      } catch (err) {
        console.error(`Erro na regra ${rule.name}:`, err);
      }
      results[rule.name] = count;
    }

    return new Response(
      JSON.stringify({ ok: true, rules_processed: rules.length, executions_created: results }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro no processamento manual:", error);
    return new Response(JSON.stringify({ error: "Erro interno" }), { status: 500 });
  }
}