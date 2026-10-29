import { NextResponse } from "next/server";
import { queryOne, run } from "@/lib/db";
import { DEFAULT_TASK_MODELS } from "@/lib/ai";

const DEFAULTS = {
  openrouter_api_key: "",
  company_name: "Mavox",
  company_email: "contato@mavox.com.br",
  company_phone: "(21) 99999-9999",
  company_address: "",
  whatsapp_number: "5521992855872",
  meta_pixel_id: "",
  google_ads_id: "",
  smtp_host: "",
  smtp_port: 587,
  smtp_user: "",
  smtp_password: "",
  smtp_secure: false,
  smtp_from_name: "",
  smtp_from_email: "",
  ai_models: DEFAULT_TASK_MODELS,
  daily_agent_model: "",
  daily_agent_enabled: true,
  daily_agent_last_run: null as string | null,
};

export async function GET() {
  try {
    const settings = await queryOne<Record<string, unknown>>(
      `SELECT * FROM settings WHERE id = 1`
    );

    if (!settings) {
      return NextResponse.json(DEFAULTS);
    }

    let aiModels: Record<string, string> = {};
    if (settings.ai_models && typeof settings.ai_models === "object") {
      aiModels = settings.ai_models as Record<string, string>;
    } else if (typeof settings.ai_models === "string") {
      try {
        aiModels = JSON.parse(settings.ai_models);
      } catch {
        aiModels = {};
      }
    }

    return NextResponse.json({
      ...DEFAULTS,
      ...settings,
      ai_models: { ...DEFAULT_TASK_MODELS, ...aiModels },
    });
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    return NextResponse.json(
      {
        ...DEFAULTS,
        _warning:
          "Não foi possível ler a tabela settings. Rode db/migrations/002_phase2_ai_smtp.sql no Neon.",
      },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      openrouter_api_key = "",
      company_name = "Mavox",
      company_email = "",
      company_phone = "",
      company_address = "",
      whatsapp_number = "",
      meta_pixel_id = "",
      google_ads_id = "",
      smtp_host = "",
      smtp_port = 587,
      smtp_user = "",
      smtp_password = "",
      smtp_secure = false,
      smtp_from_name = "",
      smtp_from_email = "",
      ai_models = {},
      daily_agent_model = "",
      daily_agent_enabled = true,
    } = body;

    const safeModels =
      typeof ai_models === "string" ? ai_models : JSON.stringify(ai_models ?? {});
    const portNumber = Number(smtp_port) || 587;
    const secure = Boolean(smtp_secure) || portNumber === 465;

    const existing = await queryOne(`SELECT id FROM settings WHERE id = 1`);

    if (existing) {
      await run(
        `UPDATE settings SET
           openrouter_api_key = $1, company_name = $2, company_email = $3,
           company_phone = $4, company_address = $5, whatsapp_number = $6,
           meta_pixel_id = $7, google_ads_id = $8,
           smtp_host = $9, smtp_port = $10, smtp_user = $11, smtp_password = $12,
           smtp_secure = $13, smtp_from_name = $14, smtp_from_email = $15,
           ai_models = $16::jsonb, daily_agent_model = $17, daily_agent_enabled = $18,
           updated_at = CURRENT_TIMESTAMP
         WHERE id = 1`,
        [
          openrouter_api_key,
          company_name,
          company_email,
          company_phone,
          company_address,
          whatsapp_number,
          meta_pixel_id,
          google_ads_id,
          smtp_host,
          portNumber,
          smtp_user,
          smtp_password,
          secure,
          smtp_from_name,
          smtp_from_email,
          safeModels,
          daily_agent_model,
          Boolean(daily_agent_enabled),
        ]
      );
    } else {
      await run(
        `INSERT INTO settings (
           id, openrouter_api_key, company_name, company_email, company_phone,
           company_address, whatsapp_number, meta_pixel_id, google_ads_id,
           smtp_host, smtp_port, smtp_user, smtp_password, smtp_secure,
           smtp_from_name, smtp_from_email, ai_models, daily_agent_model,
           daily_agent_enabled
         ) VALUES (
           1, $1, $2, $3, $4, $5, $6, $7, $8,
           $9, $10, $11, $12, $13, $14, $15, $16::jsonb, $17, $18
         )`,
        [
          openrouter_api_key,
          company_name,
          company_email,
          company_phone,
          company_address,
          whatsapp_number,
          meta_pixel_id,
          google_ads_id,
          smtp_host,
          portNumber,
          smtp_user,
          smtp_password,
          secure,
          smtp_from_name,
          smtp_from_email,
          safeModels,
          daily_agent_model,
          Boolean(daily_agent_enabled),
        ]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving settings:", error);
    const raw = error instanceof Error ? error.message : String(error);
    if (raw.includes("column") || raw.includes("does not exist")) {
      return NextResponse.json(
        {
          error:
            "Estrutura de configurações desatualizada. Rode db/migrations/002_phase2_ai_smtp.sql no Neon e tente novamente.",
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Erro ao salvar configurações" }, { status: 500 });
  }
}
