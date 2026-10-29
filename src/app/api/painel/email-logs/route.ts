import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get("limit") || 50), 200);
    const status = url.searchParams.get("status");

    const params: unknown[] = [];
    let where = "";
    if (status === "sent" || status === "error") {
      params.push(status);
      where = `WHERE status = $${params.length}`;
    }
    params.push(limit);

    const rows = await query(
      `SELECT id, to_email, subject, template_key, status, error, created_at
       FROM email_logs
       ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length}`,
      params
    );

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("Erro ao buscar logs de e-mail:", error);
    const raw = error instanceof Error ? error.message : String(error);
    if (raw.includes("does not exist")) {
      return NextResponse.json({
        data: [],
        warning:
          "Tabela email_logs não existe. Rode db/migrations/002_phase2_ai_smtp.sql no Neon.",
      });
    }
    return NextResponse.json({ error: "Erro ao buscar logs" }, { status: 500 });
  }
}
