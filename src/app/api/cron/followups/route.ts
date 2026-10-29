import { query, queryOne, run } from "@/lib/db";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || req.nextUrl.searchParams.get("token");
  if (auth !== process.env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401 });
  }

  const rules = await query(`SELECT id, name, trigger_type, trigger_config FROM followup_rules WHERE active = true`) as { id: string; trigger_type: string; trigger_config: string | object }[];
  const executions: { id: string; rule_id: string; lead_id: string | null; quote_id: string | null; status: string; created_at: string }[] = [];

  for (const rule of rules) {
    const config = typeof rule.trigger_config === "string" ? JSON.parse(rule.trigger_config) : (rule.trigger_config || {});
    const days = config.days || 7;
    const stage = config.stage || null;

    const pending = await queryOne(
      `SELECT id FROM quotes q JOIN clients c ON q.client_id = c.id WHERE q.status = $1 AND q.created_at < NOW() - INTERVAL '${days} days' LIMIT 1`,
      [stage || "proposta_enviada"]
    );

    if (pending) {
      await run(
        `INSERT INTO followup_executions (rule_id, lead_id, quote_id, status, channel) VALUES ($1, $2, $3, 'pending', $4) ON CONFLICT DO NOTHING`,
        [rule.id, null, null, "whatsapp"]
      );
      executions.push({ id: rule.id, rule_id: rule.id, lead_id: null, quote_id: null, status: "pending", created_at: new Date().toISOString() });
    }
  }

  return new Response(JSON.stringify({ ok: true, rules_checked: rules.length, executions }), { status: 200, headers: { "Content-Type": "application/json" } });
}
