"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Save, Zap, FileText, Settings as SettingsIcon, Trash2 } from "lucide-react";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  status: string;
  published_at: string | null;
  ai_generated: boolean;
  created_at: string;
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    status: "draft" as "draft" | "published" | "scheduled",
    ai_generated: false,
  });
  const [error, setError] = useState("");
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchSettings();
  }, []);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/painel/blog/${(await params).id}`, { credentials: 'include' });
      if (!res.ok) {
        router.push("/painel/blog");
        return;
      }
      const data = await res.json();
      setPost(data);
      setFormData({
        title: data.title || "",
        slug: data.slug || "",
        content: data.content || "",
        excerpt: data.excerpt || "",
        status: data.status || "draft",
        ai_generated: data.ai_generated || false,
      });
    } catch (err) {
      console.error("Error fetching post:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/painel/settings", { credentials: 'include' });
      const data = await res.json();
      setApiKeyConfigured(!!data.openrouter_api_key);
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  const handleGenerateAI = async () => {
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/painel/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          trending_topic: formData.title || "",
          mavox_data: "Agência de desenvolvimento web, sites institucionais, e-commerce, sistemas sob medida, tráfego pago, branding e manutenção",
          objective: formData.content ? "Melhorar e expandir o conteúdo existente" : "Criar artigo completo otimizado para SEO",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao gerar texto com IA");
        setGenerating(false);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        content: data.content || prev.content,
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
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/painel/blog/${(await params).id}`, {
        method: "PUT",
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
        setSaving(false);
        return;
      }

      router.push("/painel/blog");
      router.refresh();
    } catch (err) {
      setError("Erro ao salvar artigo");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este artigo?")) return;
    try {
      const res = await fetch(`/api/painel/blog/${(await params).id}`, { method: "DELETE", credentials: 'include' });
      if (!res.ok) throw new Error("Erro ao excluir");
      router.push("/painel/blog");
      router.refresh();
    } catch (err) {
      setError("Erro ao excluir artigo");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900">Artigo não encontrado</h2>
        <Link href="/painel/blog" className="mt-4 text-blue-600 hover:text-blue-700">
          Voltar à lista
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/painel/blog" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a] dark:text-[#f1f5f9]">Editar Artigo</h1>
            <p className="text-[#64748b] dark:text-[#94a3b8] mt-1">Edite o conteúdo do artigo</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !formData.title || !formData.slug}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:text-red-400">
          <Trash2 className="w-5 h-5 flex-shrink-0" />
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
              className="w-full px-4 py-2 border border-[#cbd5e1] dark:border-[#475569] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors dark:bg-[#334155] dark:text-[#f1f5f9]"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-[#e2e8f0] dark:border-[#334155] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0f172a] dark:text-[#f1f5f9]">Geração com IA</h2>
            <button
              onClick={handleGenerateAI}
              disabled={generating || !apiKeyConfigured}
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
          <div className="text-sm text-[#64748b] dark:text-[#94a3b8] mb-4">
            Gere ou melhore o conteúdo do artigo usando IA baseada em trending topics.
          </div>
          {apiKeyConfigured ? (
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">Chave OpenRouter configurada ✓</p>
          ) : (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              Configure a chave OpenRouter em Configurações para usar a IA.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Conteúdo</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={15}
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

        <div className="grid gap-4 md:grid-cols-2">
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
        </div>
      </form>
    </div>
  );
}
