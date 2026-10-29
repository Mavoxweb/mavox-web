import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { validateOpenRouterKey } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    let key: string = body.key || "";

    if (!key) {
      const row = await queryOne<{ openrouter_api_key: string | null }>(
        `SELECT openrouter_api_key FROM settings WHERE id = 1`
      );
      key = row?.openrouter_api_key || process.env.OPENROUTER_API_KEY || "";
    }

    const result = await validateOpenRouterKey(key);

    return NextResponse.json({
      ok: result.ok,
      label: result.label,
      usage: result.usage,
      limit: result.limit,
      error: result.error,
      modelCount: result.models?.length ?? 0,
      models: (result.models ?? [])
        .filter(
          (model) =>
            model.id.includes("nemotron") ||
            model.id.includes(":free") ||
            model.id.startsWith("openai/") ||
            model.id.startsWith("anthropic/") ||
            model.id.startsWith("google/")
        )
        .slice(0, 60),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Erro ao validar a chave",
      },
      { status: 500 }
    );
  }
}
