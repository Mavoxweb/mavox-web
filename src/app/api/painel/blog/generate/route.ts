import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { callOpenRouter, resolveModel } from "@/lib/ai";
import { contentToHtml, isBlogAgent, type BlogAgentId } from "@/lib/blog-content";

interface GenerateBody {
  trending_topic?: string;
  topic?: string;
  mavox_data?: string;
  objective?: string;
  model?: string;
  agent?: string;
  current_content?: string;
}

interface SettingsRow {
  openrouter_api_key: string | null;
  ai_models: Record<string, string> | string | null;
}

const MAVOX_CONTEXT =
  "Agência de desenvolvimento web no Rio de Janeiro: sites institucionais, landing pages de alta conversão, e-commerce, sistemas sob medida, tráfego pago (Google Ads e Meta Ads), branding e manutenção.";

const AGENT_PROMPTS: Record<BlogAgentId, string> = {
  blog_writer: `Você é o Blog Writer da Mavox: redator sênior de marketing digital e copywriting.
TAREFA: escrever um artigo completo, original e otimizado para SEO e conversão.
REGRAS:
- 800 a 1200 palavras em português do Brasil.
- Comece com um gancho forte (sem repetir o título como H1).
- Use apenas H2 (##) e H3 (###), hierarquicamente.
- Parágrafos curtos, exemplos práticos e linguagem clara.
- Inclua uma seção "Por que escolher a Mavox".
- NÃO inclua blocos de CTA/botões: eles são injetados automaticamente.
- Retorne somente markdown, sem cercas de código.`,

  seo_specialist: `Você é o SEO Specialist da Mavox.
TAREFA: otimizar o conteúdo existente para SEO, mantendo os fatos e a voz da marca.
REGRAS:
- Preserve a intenção e as informações corretas do texto original.
- Melhore título, introdução, hierarquia de H2/H3 e palavras-chave relacionadas.
- Elimine redundâncias e trechos genéricos; mantenha densidade natural (sem keyword stuffing).
- Inclua uma seção "Perguntas frequentes" com 3 perguntas e respostas curtas.
- NÃO invente números, clientes ou resultados.
- NÃO inclua blocos de CTA/botões: eles são injetados automaticamente.
- Retorne somente markdown, sem cercas de código.`,

  case_study_writer: `Você é o Case Study Writer da Mavox.
TAREFA: escrever um estudo de caso no formato contexto → desafio → solução → resultados.
REGRAS:
- Estrutura obrigatória: "Contexto do cliente", "O desafio", "A solução da Mavox", "Resultados", "Conclusão".
- Use marcadores [dados do case] onde faltarem números ou fatos; NUNCA invente métricas.
- Tom profissional, específico e orientado a provas.
- 700 a 1000 palavras em português do Brasil.
- NÃO inclua blocos de CTA/botões: eles são injetados automaticamente.
- Retorne somente markdown, sem cercas de código.`,
};

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

function cleanMarkdown(value: string): string {
  return value
    .replace(/^\s*```(?:markdown|md|html)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateBody;
    const topic = (body.topic || body.trending_topic || "").trim();
    const agent: BlogAgentId = isBlogAgent(body.agent) ? body.agent : "blog_writer";
    const currentContent = (body.current_content || "").trim();

    let settings: SettingsRow | null = null;
    try {
      settings = await queryOne<SettingsRow>(
        `SELECT openrouter_api_key, ai_models FROM settings WHERE id = 1`
      );
    } catch {
      settings = null;
    }

    const openrouterApiKey =
      (settings?.openrouter_api_key && settings.openrouter_api_key.trim()
        ? settings.openrouter_api_key.trim()
        : process.env.OPENROUTER_API_KEY || "").trim();

    if (!openrouterApiKey) {
      return NextResponse.json(
        {
          error:
            "OpenRouter API key não configurada. Acesse /painel/settings › IA & Agente para configurar.",
        },
        { status: 400 }
      );
    }

    if (!topic && !currentContent) {
      return NextResponse.json(
        { error: "Informe o tema do artigo ou gere a partir do conteúdo atual." },
        { status: 400 }
      );
    }

    if (agent === "seo_specialist" && !currentContent) {
      return NextResponse.json(
        { error: "O SEO Specialist precisa de um conteúdo existente para otimizar." },
        { status: 400 }
      );
    }

    const selectedModel =
      body.model ||
      resolveModel(parseModels(settings?.ai_models ?? null), "blog_writer");

    const userPrompt = `TEMA: ${topic || "(otimizar o conteúdo existente abaixo)"}
OBJETIVO: ${body.objective || "Gerar leads qualificados para a Mavox"}
CONTEXTO DA MAVOX: ${body.mavox_data || MAVOX_CONTEXT}
${
  currentContent
    ? `\nCONTEÚDO ATUAL (referência obrigatória):\n"""\n${currentContent.slice(0, 12000)}\n"""`
    : ""
}`;

    const result = await callOpenRouter({
      apiKey: openrouterApiKey,
      model: selectedModel,
      temperature: agent === "seo_specialist" ? 0.4 : 0.7,
      maxTokens: 3800,
      messages: [
        { role: "system", content: AGENT_PROMPTS[agent] },
        { role: "user", content: userPrompt },
      ],
    });

    if (!result.ok) {
      console.error("OpenRouter error:", result.error);
      return NextResponse.json(
        { error: `Erro ao gerar conteúdo com IA: ${result.error ?? "desconhecido"}` },
        { status: 502 }
      );
    }

    const markdown = cleanMarkdown(result.content ?? "");
    const html = contentToHtml(markdown);

    return NextResponse.json({
      content: html,
      markdown,
      model: selectedModel,
      agent,
    });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
