import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

interface ModelRow {
  id: string;
  name?: string;
}

export async function GET() {
  try {
    const settings = await queryOne<{ openrouter_api_key: string | null }>(
      `SELECT openrouter_api_key FROM settings WHERE id = 1`
    );

    const apiKey =
      settings?.openrouter_api_key || process.env.OPENROUTER_API_KEY || "";

    if (!apiKey) {
      return NextResponse.json({ configured: false, models: [] });
    }

    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { configured: true, models: [], error: "Não foi possível listar os modelos." },
        { status: 502 }
      );
    }

    const payload = (await response.json()) as { data?: ModelRow[] };
    const models = (payload.data ?? [])
      .filter((model) =>
        ["openai/", "anthropic/", "google/", "x-ai/", "deepseek/", "meta-llama/"].some(
          (prefix) => model.id.startsWith(prefix)
        ) || model.id.includes(":free")
      )
      .slice(0, 80)
      .map((model) => ({ id: model.id, name: model.name || model.id }));

    return NextResponse.json({ configured: true, models });
  } catch (error) {
    console.error("Erro ao listar modelos da OpenRouter:", error);
    return NextResponse.json(
      { configured: false, models: [], error: "Erro ao listar modelos." },
      { status: 500 }
    );
  }
}
