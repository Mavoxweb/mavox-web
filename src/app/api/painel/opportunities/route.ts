import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { runDailyAgent } from "@/lib/daily-agent";

export async function GET() {
  try {
    const data = await query(
      `SELECT id, run_date, title, description, category, priority,
              related_type, related_id, action_url, action_label, source,
              status, created_at
       FROM ai_opportunities
       WHERE status = 'aberta'
       ORDER BY
         CASE priority WHEN 'alta' THEN 0 WHEN 'media' THEN 1 ELSE 2 END,
         created_at DESC
       LIMIT 30`
    );

    let lastRun: string | null = null;
    try {
      const row = await queryOne<{ daily_agent_last_run: string | null }>(
        `SELECT daily_agent_last_run FROM settings WHERE id = 1`
      );
      lastRun = row?.daily_agent_last_run ?? null;
    } catch {
      lastRun = null;
    }

    return NextResponse.json({ data, lastRun });
  } catch (error) {
    console.error("Erro ao buscar oportunidades:", error);
    const raw = error instanceof Error ? error.message : String(error);
    if (raw.includes("does not exist")) {
      return NextResponse.json({
        data: [],
        lastRun: null,
        warning:
          "Tabela ai_opportunities não existe. Rode db/migrations/002_phase2_ai_smtp.sql no Neon.",
      });
    }
    return NextResponse.json({ error: "Erro ao buscar oportunidades" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await runDailyAgent();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao executar agente diário:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao executar o agente diário",
      },
      { status: 500 }
    );
  }
}
