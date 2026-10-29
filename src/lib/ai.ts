export interface AiTaskDefinition {
  key: string;
  label: string;
  description: string;
  defaultModel: string;
}

export const AI_TASKS: AiTaskDefinition[] = [
  {
    key: "blog_writer",
    label: "Blog Writer",
    description: "Geração e expansão de artigos do blog",
    defaultModel: "nvidia/nemotron-3-ultra-550b-a55b:free",
  },
  {
    key: "lead_analyzer",
    label: "Lead Analyzer",
    description: "Análise de leads e priorização comercial",
    defaultModel: "nvidia/nemotron-3-ultra-550b-a55b:free",
  },
  {
    key: "daily_agent",
    label: "Agente Diário (Oportunidades)",
    description: "Análise diária que gera cards de oportunidade no dashboard",
    defaultModel: "nvidia/nemotron-3-ultra-550b-a55b:free",
  },
  {
    key: "onboarding_assistant",
    label: "Onboarding Assistant",
    description: "Apoio ao onboarding de novos clientes",
    defaultModel: "nvidia/nemotron-3-ultra-550b-a55b:free",
  },
  {
    key: "followup_writer",
    label: "Follow-up Writer",
    description: "Redação de mensagens automáticas de follow-up",
    defaultModel: "nvidia/nemotron-3-ultra-550b-a55b:free",
  },
];

export const DEFAULT_TASK_MODELS: Record<string, string> = Object.fromEntries(
  AI_TASKS.map((task) => [task.key, task.defaultModel])
);

export interface AiModelsConfig {
  [taskKey: string]: string;
}

export function resolveModel(
  aiModels: AiModelsConfig | null | undefined,
  taskKey: string,
  fallback?: string | null
): string {
  return (
    aiModels?.[taskKey] ||
    fallback ||
    DEFAULT_TASK_MODELS[taskKey] ||
    DEFAULT_TASK_MODELS.daily_agent
  );
}

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CallOpenRouterInput {
  apiKey: string;
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface CallOpenRouterResult {
  ok: boolean;
  content?: string;
  error?: string;
}

export async function callOpenRouter(
  input: CallOpenRouterInput
): Promise<CallOpenRouterResult> {
  if (!input.apiKey) {
    return { ok: false, error: "Chave OpenRouter não configurada." };
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://mavox.com.br",
        "X-Title": "Mavox Painel",
      },
      body: JSON.stringify({
        model: input.model,
        messages: input.messages,
        temperature: input.temperature ?? 0.4,
        max_tokens: input.maxTokens ?? 1500,
        ...(input.jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: AbortSignal.timeout(45000),
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        ok: false,
        error: `OpenRouter ${res.status}: ${text.slice(0, 300)}`,
      };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return { ok: false, error: "OpenRouter retornou resposta vazia." };
    }
    return { ok: true, content };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erro ao chamar OpenRouter",
    };
  }
}

export interface ValidateKeyResult {
  ok: boolean;
  error?: string;
  label?: string;
  usage?: number;
  limit?: number | null;
  models?: { id: string; name: string }[];
}

export async function validateOpenRouterKey(key: string): Promise<ValidateKeyResult> {
  if (!key || !key.trim()) {
    return { ok: false, error: "Informe uma chave da OpenRouter." };
  }

  try {
    const keyRes = await fetch("https://openrouter.ai/api/v1/key", {
      headers: { Authorization: `Bearer ${key.trim()}` },
      signal: AbortSignal.timeout(15000),
    });

    if (!keyRes.ok) {
      return {
        ok: false,
        error:
          keyRes.status === 401
            ? "Chave inválida ou revogada (401)."
            : `OpenRouter respondeu ${keyRes.status}.`,
      };
    }

    const keyData = (await keyRes.json()) as {
      data?: { label?: string; usage?: number; limit?: number | null };
    };

    let models: { id: string; name: string }[] = [];
    try {
      const modelsRes = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { Authorization: `Bearer ${key.trim()}` },
        signal: AbortSignal.timeout(15000),
      });
      if (modelsRes.ok) {
        const modelsData = (await modelsRes.json()) as {
          data?: { id: string; name?: string }[];
        };
        models = (modelsData.data ?? []).map((m) => ({
          id: m.id,
          name: m.name || m.id,
        }));
      }
    } catch {
      // lista é opcional; a validação da chave já passou
    }

    return {
      ok: true,
      label: keyData.data?.label,
      usage: keyData.data?.usage,
      limit: keyData.data?.limit ?? null,
      models,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erro ao validar a chave.",
    };
  }
}
