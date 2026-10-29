import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { callOpenRouter, resolveModel } from "@/lib/ai";

interface GenerateBody {
  trending_topic?: string;
  mavox_data?: string;
  objective?: string;
  model?: string;
}

interface SettingsRow {
  openrouter_api_key: string | null;
  ai_models: Record<string, string> | string | null;
}

function parseModels(value: SettingsRow["ai_models"]): Record<string, string> | null {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value;
}

export async function POST(request: Request) {
  try {
    const body: GenerateBody = (await request.json()) as GenerateBody;
    const { trending_topic, mavox_data, objective, model } = body;

    let settings: SettingsRow | null = null;
    try {
      settings = await queryOne<SettingsRow>(
        `SELECT openrouter_api_key, ai_models FROM settings WHERE id = 1`
      );
    } catch {
      settings = null;
    }

    const openrouterApiKey =
      settings?.openrouter_api_key || process.env.OPENROUTER_API_KEY || "";

    if (!openrouterApiKey) {
      return NextResponse.json(
        {
          error:
            "OpenRouter API key não configurada. Acesse /painel/settings › IA & Agente para configurar.",
        },
        { status: 400 }
      );
    }

    if (!trending_topic) {
      return NextResponse.json({ error: "Trending topic é obrigatório" }, { status: 400 });
    }

    const selectedModel =
      model || resolveModel(parseModels(settings?.ai_models ?? null), "blog_writer");

    const prompt = `
Você é um redator especialista em marketing digital e copywriting para a Mavox, uma agência de desenvolvimento web e marketing digital.

TAREFA: Escreva um artigo de blog otimizado para SEO e conversão.

TRÊNDING TOPIC: ${trending_topic}
OBJETIVO: ${objective || "Gerar leads e vendas para a Mavox"}
DADOS DA MAVOX: ${mavox_data || "Agência de desenvolvimento web, sites institucionais, e-commerce, sistemas sob medida, tráfego pago, branding e manutenção"}

INSTRUÇÕES:
1. Escreva um artigo completo com 800-1200 palavras
2. Use título atrativo e otimizado para SEO
3. Inclua H1, H2, H3 hierarquicamente
4. Faça pelo menos 3 chamadas para ação (CTA) para serviços da Mavox
5. Inclua palavras-chave relacionadas ao trending topic
6. Escreva em português do Brasil
7. Formate com markdown
8. Comece com um gancho envolvente relacionado ao trending topic
9. Inclua uma seção "Por que escolher a Mavox"
10. Termine com uma forte call-to-action

Estrutura:
- Título H1
- Introdução com gancho
- 4-6 seções com H2
- Seção "Por que escolher a Mavox"
- Conclusão com CTA
- Meta description (no final, separada)

Escreva apenas o conteúdo do artigo em markdown.`;

    const result = await callOpenRouter({
      apiKey: openrouterApiKey,
      model: selectedModel,
      temperature: 0.7,
      maxTokens: 3000,
      messages: [
        {
          role: "system",
          content: "Você é um redator especialista em marketing digital e copywriting.",
        },
        { role: "user", content: prompt },
      ],
    });

    if (!result.ok) {
      console.error("OpenRouter error:", result.error);
      return NextResponse.json(
        { error: `Erro ao gerar conteúdo com IA: ${result.error ?? "desconhecido"}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ content: result.content, model: selectedModel });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
