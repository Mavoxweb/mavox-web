import { NextResponse } from "next/server";
import { query, run } from "@/lib/db";
import { DEFAULT_TEMPLATES, type EmailTemplate } from "@/lib/email-templates";

export async function GET() {
  let stored: EmailTemplate[] = [];
  try {
    stored = await query<EmailTemplate>(
      `SELECT key, name, subject, body_html FROM email_templates ORDER BY name ASC`
    );
  } catch {
    stored = [];
  }

  const byKey = new Map(stored.map((template) => [template.key, template]));
  const merged = DEFAULT_TEMPLATES.map((template) => byKey.get(template.key) ?? template);
  const extra = stored.filter(
    (template) => !DEFAULT_TEMPLATES.some((def) => def.key === template.key)
  );

  return NextResponse.json({ data: [...merged, ...extra] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key, name, subject, body_html } = body;

    if (!key || !name || !subject || !body_html) {
      return NextResponse.json(
        { error: "Informe key, name, subject e body_html." },
        { status: 400 }
      );
    }

    await run(
      `INSERT INTO email_templates (key, name, subject, body_html, updated_at)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (key) DO UPDATE SET
         name = EXCLUDED.name,
         subject = EXCLUDED.subject,
         body_html = EXCLUDED.body_html,
         updated_at = now()`,
      [key, name, subject, body_html]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar template:", error);
    const raw = error instanceof Error ? error.message : String(error);
    if (raw.includes("does not exist")) {
      return NextResponse.json(
        {
          error:
            "Tabela email_templates não existe. Rode db/migrations/002_phase2_ai_smtp.sql no Neon.",
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Erro ao salvar template" }, { status: 500 });
  }
}
