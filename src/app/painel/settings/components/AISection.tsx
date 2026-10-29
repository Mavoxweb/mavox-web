"use client";

import { useState } from "react";
import {
  CheckCircle,
  AlertCircle,
  Key,
  Loader2,
  Play,
  Sparkles,
  Zap,
} from "lucide-react";
import { AI_TASKS } from "@/lib/ai";

interface ValidateResult {
  ok: boolean;
  error?: string;
  label?: string;
  usage?: number;
  limit?: number | null;
  modelCount?: number;
  models?: { id: string; name: string }[];
}

interface AISectionProps {
  settings: {
    openrouter_api_key: string;
    ai_models: Record<string, string>;
    daily_agent_model: string;
    daily_agent_enabled: boolean;
    daily_agent_last_run: string | null;
  };
  onChange: (field: string, value: unknown) => void;
}

export default function AISection({ settings, onChange }: AISectionProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<ValidateResult | null>(null);
  const [running, setRunning] = useState(false);
  const [runMessage, setRunMessage] = useState("");

  const models = result?.models ?? [];

  const handleValidate = async () => {
    setValidating(true);
    setResult(null);
    try {
      const res = await fetch("/api/painel/settings/validate-openrouter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ key: settings.openrouter_api_key }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ ok: false, error: "Erro ao validar a chave." });
    } finally {
      setValidating(false);
    }
  };

  const handleRunAgent = async () => {
    setRunning(true);
    setRunMessage("");
    try {
      const res = await fetch("/api/painel/opportunities", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setRunMessage(data.error || "Erro ao executar o agente.");
      } else {
        setRunMessage(
          `${data.inserted} oportunidade(s) gerada(s)${
            data.usedAi ? " com IA" : " por regras"
          }.${data.aiError ? ` Aviso: ${data.aiError}` : ""}`
        );
      }
    } catch (error) {
      setRunMessage("Erro ao executar o agente.");
    } finally {
      setRunning(false);
    }
  };

  const updateModel = (taskKey: string, value: string) => {
    onChange("ai_models", { ...settings.ai_models, [taskKey]: value });
  };

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Zap className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Integração OpenRouter (IA)</h2>
            <p className="text-gray-500 text-sm">
              Chave de API para blog, análise de leads e agente diário
            </p>
          </div>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">OpenRouter API Key</label>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <input
              type={showApiKey ? "text" : "password"}
              value={settings.openrouter_api_key}
              onChange={(e) => onChange("openrouter_api_key", e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-16"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
            >
              {showApiKey ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          <button
            type="button"
            onClick={handleValidate}
            disabled={validating || !settings.openrouter_api_key}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {validating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Key className="w-4 h-4" />
            )}
            Validar chave
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Obtenha sua chave em{" "}
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            openrouter.ai/keys
          </a>
          . A validação consulta a OpenRouter em tempo real.
        </p>

        {result && (
          <div
            className={`mt-4 p-4 rounded-lg border text-sm ${
              result.ok
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              {result.ok ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              {result.ok ? "Chave válida e funcionando" : result.error || "Chave inválida"}
            </div>
            {result.ok && (
              <p className="mt-1 text-green-700/80">
                {result.modelCount ?? 0} modelos disponíveis
                {result.label ? ` · ${result.label}` : ""}
                {typeof result.usage === "number"
                  ? ` · uso: US$ ${result.usage.toFixed(2)}${
                      result.limit ? ` de US$ ${result.limit.toFixed(2)}` : ""
                    }`
                  : ""}
              </p>
            )}
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Modelo por tarefa</h2>
            <p className="text-gray-500 text-sm">
              Escolha qual modelo OpenRouter cada função do painel deve usar
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {AI_TASKS.map((task) => (
            <div key={task.key} className="grid gap-1 md:grid-cols-[240px_1fr] md:items-center md:gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800">{task.label}</p>
                <p className="text-xs text-gray-500">{task.description}</p>
              </div>
              <select
                value={settings.ai_models?.[task.key] || task.defaultModel}
                onChange={(e) => updateModel(task.key, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              >
                <option value={settings.ai_models?.[task.key] || task.defaultModel}>
                  {settings.ai_models?.[task.key] || task.defaultModel}
                </option>
                {models
                  .filter((model) => model.id !== (settings.ai_models?.[task.key] || task.defaultModel))
                  .map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({model.id})
                    </option>
                  ))}
              </select>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Valide a chave acima para carregar a lista de modelos disponíveis. Sem validação, você
          pode digitar o ID manualmente no campo do modelo.
        </p>

        <div className="mt-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID manual do modelo (opcional)
          </label>
          <input
            type="text"
            value={settings.daily_agent_model}
            onChange={(e) => onChange("daily_agent_model", e.target.value)}
            placeholder="nvidia/nemotron-3-ultra-550b-a55b:free"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          />
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Agente Diário de Oportunidades
            </h2>
            <p className="text-gray-500 text-sm">
              Roda todos os dias às 00:00 e publica cards de oportunidade no dashboard
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={settings.daily_agent_enabled}
              onChange={(e) => onChange("daily_agent_enabled", e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            Ativo
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleRunAgent}
            disabled={running}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Executar agora
          </button>
          <span className="text-xs text-gray-500">
            {settings.daily_agent_last_run
              ? `Última execução: ${new Date(settings.daily_agent_last_run).toLocaleString("pt-BR")}`
              : "Nenhuma execução registrada ainda"}
          </span>
        </div>

        {runMessage && (
          <p className="mt-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3">
            {runMessage}
          </p>
        )}
      </section>
    </div>
  );
}
