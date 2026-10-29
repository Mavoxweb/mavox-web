"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Save, Zap, FileText, Settings as SettingsIcon, AlertCircle } from "lucide-react";
import Link from "next/link";

interface OpenRouterModelData {
  id: string;
  name?: string;
}

interface OpenRouterModelsResponse {
  data: OpenRouterModelData[];
}

interface OpenRouterGenerateResponse {
  content: string;
}

export default function NewPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [models, setModels] = useState<OpenRouterModelData[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    status: "draft" as "draft" | "published" | "scheduled",
    ai_generated: false,
    trending_topic: "",
    ai_objective: "",
  });
  const [error, setError] = useState("");
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const res = await fetch("/api/painel/settings", { credentials: 'include' });
      const data = await res.json();
      if (data.openrouter_api_key) {
        setApiKeyConfigured(true);

        // Fetch available models from OpenRouter
        const modelsRes = await fetch("https://openrouter.ai/api/v1/models", {
          headers: {
            Authorization: `Bearer ${data.openrouter_api_key}`,
          },
        });

        if (modelsRes.ok) {
          const modelsData = await modelsRes.json();
          setModels(
            modelsData.data
              .filter((m: OpenRouterModelData) => m.id.includes("openai/") || m.id.includes("anthropic/") || m.id.includes("google/"))
              .slice(0, 20)
              .map((m: OpenRouterModelData) => ({
                id: m.id,
                name: m.name || m.id,
              }))
          );
          setSelectedModel(modelsData.data[0]?.id || "openai/gpt-3.5-turbo");
        }
      }
    } catch (err) {
      console.error("Error fetching models:", err);
    }
  };

  const handleGenerateAI = async () => {
    if (!formData.trending_topic) {
      setError("Por favor, insira um trending topic");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/painel/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          trending_topic: formData.trending_topic,
          mavox_data: "Agência de desenvolvimento web, sites institucionais, e-commerce, sistemas sob medida, tráfego pago, branding e manutenção",
          objective: formData.ai_objective || "Gerar leads e vendas para a Mavox",
        }),
      });

      const data: { content?: string; error?: string } = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao gerar texto com IA");
        setGenerating(false);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        content: data.content || "",
        ai_generated: true,
      }));
      setGenerating(false);
    } catch (err) {
      setError("Erro ao gerar conteúdo com IA");
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/painel/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, "-"),
          content: formData.content,
          excerpt: formData.excerpt,
          status: formData.status,
          published_at: formData.status === "published" ? new Date().toISOString() : null,
          ai_generated: formData.ai_generated,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao salvar artigo");
        setLoading(false);
        return;
      }

      router.push(`/painel/blog/${data.id}`);
      router.refresh();
    } catch (err) {
      setError("Erro ao salvar artigo");
      setLoading(false);
    }
  };

  // Removido bloqueio total - editor manual sempre disponível
  // A geração com IA será desabilitada se não houver API key

  return (
    <div className="space-y-6">
      {/* Warning banner if no API key */}
      {!apiKeyConfigured && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Chave da OpenRouter API não configurada
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-0.5">
                A geração de artigos com IA está desabilitada. Configure a chave em{" "}
                <Link href="/painel/settings" className="underline hover:text-yellow-600 dark:hover:text-yellow-400">
                  Configurações
                </Link>
                {" para usar o recurso."}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/painel/blog" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a] dark:text-[#f1f5f9]">Novo Artigo</h1>
            <p className="text-[#64748b] dark:text-[#94a3b8] mt-1">Crie conteúdo para o blog da Mavox</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || !formData.title || !formData.slug}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {loading ? "Salvando..." : "Salvar Artigo"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Título *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 border border-[#cbd5e1] dark:border-[#475569] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors dark:bg-[#334155] dark:text-[#f1f5f9]"
              placeholder="Título do artigo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 border border-[#cbd5e1] dark:border-[#475569] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors dark:bg-[#334155] dark:text-[#f1f5f9]"
              placeholder="slug-do-artigo"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as "draft" | "published" | "scheduled" })}
            className="w-full px-4 py-2 border border-[#cbd5e1] dark:border-[#475569] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors dark:bg-[#334155] dark:text-[#f1f5f9]"
          >
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
            <option value="scheduled">Agendado</option>
          </select>
        </div>

        <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-[#e2e8f0] dark:border-[#334155] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0f172a] dark:text-[#f1f5f9]">Geração com IA</h2>
            <button
              onClick={handleGenerateAI}
              disabled={generating || !formData.trending_topic || !apiKeyConfigured}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm font-medium flex items-center gap-2"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {generating ? "Gerando..." : "Gerar com IA"}
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Trending Topic *</label>
              <input
                type="text"
                value={formData.trending_topic}
                onChange={(e) => setFormData({ ...formData, trending_topic: e.target.value })}
                placeholder="Ex: IA em marketing digital, tendências de e-commerce 2026"
                className="w-full px-4 py-2 border border-[#cbd5e1] dark:border-[#475569] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors dark:bg-[#334155] dark:text-[#f1f5f9]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Objetivo</label>
              <input
                type="text"
                value={formData.ai_objective}
                onChange={(e) => setFormData({ ...formData, ai_objective: e.target.value })}
                placeholder="Ex: Gerar leads para serviços de tráfego pago"
                className="w-full px-4 py-2 border border-[#cbd5e1] dark:border-[#475569] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors dark:bg-[#334155] dark:text-[#f1f5f9]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Modelo IA</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={!apiKeyConfigured || models.length === 0}
                className="w-full px-4 py-2 border border-[#cbd5e1] dark:border-[#475569] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors dark:bg-[#334155] dark:text-[#f1f5f9]"
              >
                <option value="">Carregando modelos...</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {apiKeyConfigured && models.length > 0 && (
            <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-2">
              Modelo selecionado: {models.find((m) => m.id === selectedModel)?.name || selectedModel}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Conteúdo</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={12}
            className="w-full px-4 py-2 border border-[#cbd5e1] dark:border-[#475569] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors dark:bg-[#334155] dark:text-[#f1f5f9] font-mono text-sm"
            placeholder="Escreva o conteúdo do artigo aqui..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Excerto (resumo)</label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-[#cbd5e1] dark:border-[#475569] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors dark:bg-[#334155] dark:text-[#f1f5f9]"
            placeholder="Resumo curto do artigo..."
          />
        </div>
      </form>
    </div>
  );
}
