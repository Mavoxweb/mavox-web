import { NextResponse } from "next/server";

interface OpenRouterMessage {
  role: string;
  content: string;
}

interface OpenRouterChoice {
  message: {
    content: string;
  };
}

interface OpenRouterResponse {
  choices?: OpenRouterChoice[];
}

export async function POST(request: Request) {
  try {
    const body: { trending_topic?: string; mavox_data?: string; objective?: string } = await request.json();
    const { trending_topic, mavox_data, objective } = body;

    const openrouterApiKey = process.env.OPENROUTER_API_KEY;

    if (!openrouterApiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key não configurada. Acesse /painel/settings para configurar." },
        { status: 400 }
      );
    }

    if (!trending_topic) {
      return NextResponse.json({ error: "Trending topic é obrigatório" }, { status: 400 });
    }

    const prompt = `
Você é um redator especialista em marketing digital e copywriting para a Mavox, uma agência de desenvolvimento web e marketing digital.

TAREFA: Escreva um artigo de blog otimizado para SEO e conversão.

TRÊNDING TOPIC: ${trending_topic}
OBJETIVO: ${objective || "Gerar leads e vendas para a Mavox"}
DADOS DA MAVOX: ${mavox_data || "Agência de desenvolvimento web, sites institucionais, e-commerce, tráfego pago, branding e manutenção"}

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

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openrouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mavox-web-ten.vercel.app",
        "X-Title": "Mavox Blog AI",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Você é um redator especialista em marketing digital e copywriting."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter error:", errorText);
      return NextResponse.json(
        { error: "Erro ao gerar conteúdo com IA" },
        { status: 500 }
      );
    }

    const data: OpenRouterResponse = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({ content: generatedContent });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}