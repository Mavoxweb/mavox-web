"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  Check,
  Eye,
  Globe2,
  ImagePlus,
  Loader2,
  Pencil,
  Save,
  Search,
  Sparkles,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import BlogEditor from "@/components/blog/BlogEditor";
import {
  BLOG_AGENTS,
  BLOG_TIMEZONES,
  DEFAULT_TIMEZONE,
  contentToHtml,
  formatZonedDateTime,
  injectCtas,
  normalizeSlug,
  utcToZonedInput,
  zonedInputToUtc,
  type BlogAgentId,
} from "@/lib/blog-content";

interface PostRecord {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  status: string;
  published_at: string | null;
  ai_generated: boolean;
  cover_image?: string | null;
  seo_title?: string | null;
  meta_description?: string | null;
  agent?: string | null;
  cta_enabled?: boolean | null;
  scheduled_timezone?: string | null;
}

interface ModelOption {
  id: string;
  name: string;
}

interface BlogPostFormProps {
  mode: "create" | "edit";
  postId?: string;
  initialTab?: "editor" | "preview";
}

type FormStatus = "draft" | "published" | "scheduled";

interface FormState {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  seo_title: string;
  meta_description: string;
  status: FormStatus;
  published_at_iso: string;
  published_at_local: string;
  scheduled_timezone: string;
  agent: BlogAgentId;
  cta_enabled: boolean;
  ai_generated: boolean;
}

const EMPTY_FORM: FormState = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  cover_image: "",
  seo_title: "",
  meta_description: "",
  status: "draft",
  published_at_iso: "",
  published_at_local: "",
  scheduled_timezone: DEFAULT_TIMEZONE,
  agent: "blog_writer",
  cta_enabled: true,
  ai_generated: false,
};

const inputClass =
  "w-full px-3.5 py-2.5 border border-[#cbd5e1] dark:border-[#475569] rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors dark:bg-[#334155] dark:text-[#f1f5f9]";
const labelClass =
  "block text-sm font-medium text-[#334155] dark:text-[#cbd5e1] mb-1.5";
const cardClass =
  "bg-white dark:bg-[#1e293b] rounded-2xl border border-[#e2e8f0] dark:border-[#334155] p-5";

function relativeLabel(target: Date): string {
  const diffMs = target.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const minutes = Math.round(abs / 60000);
  const hours = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);

  const value =
    minutes < 60
      ? `${minutes} min`
      : hours < 24
        ? `${hours} h`
        : days === 1
          ? "1 dia"
          : `${days} dias`;

  return diffMs >= 0 ? `em ${value}` : `há ${value}`;
}

export default function BlogPostForm({
  mode,
  postId,
  initialTab = "editor",
}: BlogPostFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [tab, setTab] = useState<"editor" | "preview">(initialTab);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState<{ field?: string; error: string } | null>(null);

  const [models, setModels] = useState<ModelOption[]>([]);
  const [aiConfigured, setAiConfigured] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [aiTopic, setAiTopic] = useState("");
  const [useCurrentContent, setUseCurrentContent] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldError(null);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadModels() {
      try {
        const response = await fetch("/api/painel/blog/models", {
          credentials: "include",
          cache: "no-store",
        });
        const data = await response.json();
        if (cancelled) return;
        setAiConfigured(Boolean(data.configured));
        setModels(Array.isArray(data.models) ? data.models : []);
      } catch {
        if (!cancelled) setAiConfigured(false);
      }
    }

    async function loadPost() {
      if (mode !== "edit" || !postId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/painel/blog/${postId}`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!response.ok) {
          if (!cancelled) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }

        const post = (await response.json()) as PostRecord;
        if (cancelled) return;

        const timezone =
          BLOG_TIMEZONES.find((tz) => tz.id === post.scheduled_timezone)?.id ??
          DEFAULT_TIMEZONE;

        const local =
          post.status === "scheduled" && post.published_at
            ? utcToZonedInput(post.published_at, timezone)
            : "";

        setForm({
          title: post.title ?? "",
          slug: post.slug ?? "",
          content: post.content ?? "",
          excerpt: post.excerpt ?? "",
          cover_image: post.cover_image ?? "",
          seo_title: post.seo_title ?? "",
          meta_description: post.meta_description ?? "",
          status: (["draft", "published", "scheduled"] as const).includes(
            post.status as FormStatus
          )
            ? (post.status as FormStatus)
            : "draft",
          published_at_iso: post.published_at ?? "",
          published_at_local: local,
          scheduled_timezone: timezone,
          agent: BLOG_AGENTS.find((agent) => agent.id === post.agent)?.id ?? "blog_writer",
          cta_enabled: post.cta_enabled ?? true,
          ai_generated: Boolean(post.ai_generated),
        });
        setAiTopic(post.title ?? "");
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadModels();
    void loadPost();

    return () => {
      cancelled = true;
    };
  }, [mode, postId]);

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: slugTouched ? prev.slug : normalizeSlug(value),
    }));
  };

  const uploadCover = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    setUploadingCover(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/painel/blog/upload", {
        method: "POST",
        body,
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Falha no upload da capa.");
        return;
      }

      setForm((prev) => ({ ...prev, cover_image: data.url as string }));
      toast.success("Capa enviada.");
    } catch {
      setError("Falha no upload da capa.");
    } finally {
      setUploadingCover(false);
    }
  }, []);

  const handleGenerate = async () => {
    const topic = (aiTopic || form.title).trim();

    if (!topic && !form.content) {
      setError("Informe o tema do artigo para gerar com IA.");
      return;
    }

    if (form.agent === "seo_specialist" && !form.content.trim()) {
      setError("O SEO Specialist precisa de um conteúdo existente para otimizar.");
      return;
    }

    if (
      form.content.trim() &&
      form.agent !== "seo_specialist" &&
      !window.confirm("O conteúdo atual será substituído pelo resultado da IA. Continuar?")
    ) {
      return;
    }

    setGenerating(true);
    setError("");
    try {
      const response = await fetch("/api/painel/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          topic,
          agent: form.agent,
          model: selectedModel || undefined,
          current_content:
            form.agent === "seo_specialist" || useCurrentContent
              ? form.content
              : undefined,
          objective: "Gerar leads qualificados para a Mavox",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao gerar conteúdo com IA.");
        return;
      }

      const generated = (data.content as string) || "";
      setForm((prev) => ({
        ...prev,
        content: generated,
        ai_generated: true,
        excerpt: prev.excerpt || "",
      }));
      setTab("editor");
      toast.success("Conteúdo gerado. Revise antes de publicar.");
    } catch {
      setError("Erro ao gerar conteúdo com IA.");
    } finally {
      setGenerating(false);
    }
  };

  const scheduledPreview = useMemo(() => {
    if (form.status !== "scheduled" || !form.published_at_local) return null;
    const date = zonedInputToUtc(form.published_at_local, form.scheduled_timezone);
    if (!date) return null;
    return {
      iso: date.toISOString(),
      formatted: formatZonedDateTime(date.toISOString(), form.scheduled_timezone),
      relative: relativeLabel(date),
      isPast: date.getTime() <= Date.now(),
    };
  }, [form.status, form.published_at_local, form.scheduled_timezone]);

  const previewHtml = useMemo(
    () => injectCtas(contentToHtml(form.content), form.cta_enabled),
    [form.content, form.cta_enabled]
  );

  const previewExcerpt =
    form.excerpt ||
    form.meta_description ||
    "Resumo do artigo aparece aqui — ele também alimenta a meta description.";

  const savingDisabled =
    saving ||
    !form.title.trim() ||
    !form.slug.trim() ||
    (form.status === "scheduled" && (!scheduledPreview || scheduledPreview.isPast));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (savingDisabled) return;

    setSaving(true);
    setError("");
    setFieldError(null);

    const publishedAt =
      form.status === "draft"
        ? null
        : form.status === "scheduled"
          ? scheduledPreview?.iso ?? null
          : form.published_at_iso || new Date().toISOString();

    try {
      const response = await fetch(
        mode === "edit" ? `/api/painel/blog/${postId}` : "/api/painel/blog",
        {
          method: mode === "edit" ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: form.title,
            slug: form.slug,
            content: form.content,
            excerpt: form.excerpt,
            cover_image: form.cover_image,
            seo_title: form.seo_title,
            meta_description: form.meta_description,
            status: form.status,
            agent: form.agent,
            cta_enabled: form.cta_enabled,
            ai_generated: form.ai_generated,
            scheduled_timezone: form.scheduled_timezone,
            published_at: publishedAt,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setFieldError({ field: data.field, error: data.error || "Erro ao salvar artigo." });
        setError(data.error || "Erro ao salvar artigo.");
        return;
      }

      toast.success(mode === "edit" ? "Artigo atualizado." : "Artigo criado.");

      if (mode === "create" && data.id) {
        router.push(`/painel/blog/${data.id}`);
        router.refresh();
      } else {
        router.refresh();
      }
    } catch {
      setError("Erro ao salvar artigo.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (mode !== "edit" || !postId) return;
    if (!window.confirm("Tem certeza que deseja excluir este artigo?")) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/painel/blog/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error();
      toast.success("Artigo excluído.");
      router.push("/painel/blog");
      router.refresh();
    } catch {
      setError("Erro ao excluir artigo.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-[#0f172a] dark:text-[#f1f5f9]">
          Artigo não encontrado
        </h2>
        <Link href="/painel/blog" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
          Voltar à lista
        </Link>
      </div>
    );
  }

  const coverIsImage = form.cover_image.startsWith("/api/media/") || /^https?:\/\//.test(form.cover_image);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/painel/blog"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a] dark:text-[#f1f5f9]">
              {mode === "edit" ? "Editar Artigo" : "Novo Artigo"}
            </h1>
            <p className="text-sm text-[#64748b] dark:text-[#94a3b8] mt-0.5">
              Editor rico, agentes de IA, CTAs automáticos e agendamento.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {mode === "edit" && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors text-sm font-medium flex items-center gap-2"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Excluir
            </button>
          )}
          <button
            type="submit"
            disabled={savingDisabled}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5 min-w-0">
          <div className={cardClass}>
            <label className={labelClass} htmlFor="post-title">
              Título *
            </label>
            <input
              id="post-title"
              type="text"
              value={form.title}
              onChange={(event) => handleTitleChange(event.target.value)}
              placeholder="Ex.: Como escolher uma agência de sites no Rio de Janeiro"
              required
              className={`${inputClass} text-base font-semibold`}
            />

            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              <div>
                <label className={labelClass} htmlFor="post-slug">
                  Slug (URL)
                </label>
                <input
                  id="post-slug"
                  type="text"
                  value={form.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    update("slug", event.target.value);
                  }}
                  onBlur={() => update("slug", normalizeSlug(form.slug || form.title))}
                  placeholder="como-escolher-agencia"
                  required
                  className={inputClass}
                />
                <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-1 truncate">
                  /blog/{form.slug || "..."}
                </p>
              </div>
              <div>
                <label className={labelClass} htmlFor="post-excerpt">
                  Resumo (usado na listagem)
                </label>
                <textarea
                  id="post-excerpt"
                  value={form.excerpt}
                  onChange={(event) => update("excerpt", event.target.value)}
                  rows={2}
                  placeholder="Se vazio, é gerado a partir do conteúdo."
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-[#e2e8f0] dark:border-[#334155] overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-[#e2e8f0] dark:border-[#334155] px-4 py-3">
              <div className="inline-flex rounded-lg bg-[#f1f5f9] dark:bg-[#0f172a] p-1">
                <button
                  type="button"
                  onClick={() => setTab("editor")}
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    tab === "editor"
                      ? "bg-white dark:bg-[#334155] text-[#0f172a] dark:text-[#f1f5f9] shadow-sm"
                      : "text-[#64748b] dark:text-[#94a3b8]"
                  }`}
                >
                  <Pencil className="w-4 h-4" /> Editor
                </button>
                <button
                  type="button"
                  onClick={() => setTab("preview")}
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    tab === "preview"
                      ? "bg-white dark:bg-[#334155] text-[#0f172a] dark:text-[#f1f5f9] shadow-sm"
                      : "text-[#64748b] dark:text-[#94a3b8]"
                  }`}
                >
                  <Eye className="w-4 h-4" /> Preview
                </button>
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-[#475569] dark:text-[#cbd5e1] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.cta_enabled}
                  onChange={(event) => update("cta_enabled", event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                CTAs automáticos
              </label>
            </div>

            {tab === "editor" ? (
              <div className="p-4">
                <BlogEditor
                  value={form.content}
                  onChange={(html) => update("content", html)}
                />
              </div>
            ) : (
              <div className="p-4 sm:p-6 bg-[#fafafc] dark:bg-[#0f172a]">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b] dark:text-[#94a3b8] mb-3">
                  Como o leitor verá (CTAs {form.cta_enabled ? "ativos" : "desativados"})
                </p>
                <article className="bg-white dark:bg-[#1e293b] rounded-xl border border-[#e2e8f0] dark:border-[#334155] p-5 sm:p-8">
                  {coverIsImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.cover_image}
                      alt={form.title || "Capa do artigo"}
                      className="w-full aspect-[16/9] object-cover rounded-lg mb-6"
                    />
                  )}
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-[#f1f5f9] mb-3">
                    {form.title || "Título do artigo"}
                  </h1>
                  <p className="text-[#64748b] dark:text-[#94a3b8] mb-6">{previewExcerpt}</p>

                  {form.content.trim() ? (
                    <div
                      className="blog-body"
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  ) : (
                    <p className="text-sm text-[#94a3b8]">
                      O conteúdo do artigo aparecerá aqui.
                    </p>
                  )}
                </article>
              </div>
            )}
          </div>

          <div className={cardClass}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="text-base font-bold text-[#0f172a] dark:text-[#f1f5f9]">
                Agente de IA
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="post-agent">
                  Agente
                </label>
                <select
                  id="post-agent"
                  value={form.agent}
                  onChange={(event) => update("agent", event.target.value as BlogAgentId)}
                  className={inputClass}
                >
                  {BLOG_AGENTS.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-1">
                  {BLOG_AGENTS.find((agent) => agent.id === form.agent)?.description}
                </p>
              </div>

              <div>
                <label className={labelClass} htmlFor="post-model">
                  Modelo
                </label>
                <select
                  id="post-model"
                  value={selectedModel}
                  onChange={(event) => setSelectedModel(event.target.value)}
                  className={inputClass}
                  disabled={!aiConfigured}
                >
                  <option value="">Modelo padrão do agente</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
                {!aiConfigured && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    Configure a chave OpenRouter em Configurações › IA.
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] mt-4 items-end">
              <div>
                <label className={labelClass} htmlFor="post-ai-topic">
                  Tema / briefing
                </label>
                <input
                  id="post-ai-topic"
                  type="text"
                  value={aiTopic}
                  onChange={(event) => setAiTopic(event.target.value)}
                  placeholder={form.title || "Tema do artigo para a IA"}
                  className={inputClass}
                />
              </div>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating || !aiConfigured}
                className="h-[42px] px-5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold flex items-center justify-center gap-2"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {generating ? "Gerando..." : "Gerar com IA"}
              </button>
            </div>

            <label className="mt-3 inline-flex items-center gap-2 text-xs text-[#475569] dark:text-[#cbd5e1] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useCurrentContent || form.agent === "seo_specialist"}
                disabled={form.agent === "seo_specialist"}
                onChange={(event) => setUseCurrentContent(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              Usar o conteúdo atual como base
            </label>
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-4 self-start">
          <div className={cardClass}>
            <h2 className="text-sm font-bold text-[#0f172a] dark:text-[#f1f5f9] mb-3 flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-blue-600" /> Publicação
            </h2>

            <label className={labelClass} htmlFor="post-status">
              Status
            </label>
            <select
              id="post-status"
              value={form.status}
              onChange={(event) => update("status", event.target.value as FormStatus)}
              className={inputClass}
            >
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
              <option value="scheduled">Agendado</option>
            </select>

            {form.status === "scheduled" && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className={labelClass} htmlFor="post-schedule">
                    Data e hora
                  </label>
                  <input
                    id="post-schedule"
                    type="datetime-local"
                    value={form.published_at_local}
                    onChange={(event) => update("published_at_local", event.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="post-timezone">
                    Fuso horário
                  </label>
                  <select
                    id="post-timezone"
                    value={form.scheduled_timezone}
                    onChange={(event) => update("scheduled_timezone", event.target.value)}
                    className={inputClass}
                  >
                    {BLOG_TIMEZONES.map((tz) => (
                      <option key={tz.id} value={tz.id}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  className={`rounded-xl px-3.5 py-3 text-xs leading-relaxed border ${
                    scheduledPreview?.isPast
                      ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-300"
                      : "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-900/50 dark:text-blue-200"
                  }`}
                >
                  <CalendarClock className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  {scheduledPreview ? (
                    <>
                      Vai ao ar em <strong>{scheduledPreview.formatted}</strong> ({scheduledPreview.relative}).
                      {scheduledPreview.isPast && " Escolha uma data futura."}
                    </>
                  ) : (
                    "Escolha a data e a hora para ver o preview do agendamento."
                  )}
                </div>
              </div>
            )}

            {form.status === "published" && form.published_at_iso && (
              <p className="mt-3 text-xs text-[#64748b] dark:text-[#94a3b8]">
                Publicado em{" "}
                {formatZonedDateTime(form.published_at_iso, form.scheduled_timezone)}
              </p>
            )}
          </div>

          <div className={cardClass}>
            <h2 className="text-sm font-bold text-[#0f172a] dark:text-[#f1f5f9] mb-3 flex items-center gap-2">
              <ImagePlus className="w-4 h-4 text-blue-600" /> Imagem de capa
            </h2>

            {coverIsImage ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.cover_image}
                  alt="Capa"
                  className="w-full aspect-[16/9] object-cover rounded-xl border border-[#e2e8f0] dark:border-[#334155]"
                />
                <button
                  type="button"
                  onClick={() => update("cover_image", "")}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
                  title="Remover capa"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(event) => {
                  if (event.dataTransfer.types.includes("Files")) event.preventDefault();
                }}
                onDrop={(event) => {
                  const file = event.dataTransfer.files?.[0];
                  if (!file) return;
                  event.preventDefault();
                  void uploadCover(file);
                }}
                className="border-2 border-dashed border-[#cbd5e1] dark:border-[#475569] rounded-xl p-6 text-center"
              >
                <ImagePlus className="w-7 h-7 mx-auto text-[#94a3b8] mb-2" />
                <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mb-3">
                  Arraste uma imagem ou selecione um arquivo (até 5 MB).
                </p>
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-[#cbd5e1] dark:border-[#475569] rounded-lg text-sm font-medium text-[#334155] dark:text-[#cbd5e1] hover:bg-[#f8fafc] dark:hover:bg-[#334155] transition-colors"
                >
                  {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                  {uploadingCover ? "Enviando..." : "Escolher imagem"}
                </button>
              </div>
            )}

            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadCover(file);
                event.target.value = "";
              }}
            />

            <p className="text-xs text-[#94a3b8] mt-3">
              Imagem usada no card do blog e nas meta tags Open Graph / Twitter.
            </p>
          </div>

          <div className={cardClass}>
            <h2 className="text-sm font-bold text-[#0f172a] dark:text-[#f1f5f9] mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" /> SEO
            </h2>

            <label className={labelClass} htmlFor="post-seo-title">
              Título SEO
            </label>
            <input
              id="post-seo-title"
              type="text"
              value={form.seo_title}
              onChange={(event) => update("seo_title", event.target.value)}
              placeholder={form.title || "Título para Google e redes sociais"}
              className={inputClass}
            />
            <p className={`text-xs mt-1 ${form.seo_title.length > 60 ? "text-amber-600" : "text-[#94a3b8]"}`}>
              {form.seo_title.length}/60 caracteres
            </p>

            <label className={`${labelClass} mt-4`} htmlFor="post-meta">
              Meta description
            </label>
            <textarea
              id="post-meta"
              value={form.meta_description}
              onChange={(event) => update("meta_description", event.target.value)}
              rows={3}
              placeholder={form.excerpt || "Descrição exibida nos resultados de busca."}
              className={inputClass}
            />
            <p className={`text-xs mt-1 ${form.meta_description.length > 160 ? "text-amber-600" : "text-[#94a3b8]"}`}>
              {form.meta_description.length}/160 caracteres
            </p>

            <div className="mt-4 rounded-xl border border-[#e2e8f0] dark:border-[#334155] p-3">
              <p className="text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
                Preview no Google
              </p>
              <p className="text-sm text-[#1a0dab] dark:text-blue-400 truncate">
                {form.seo_title || form.title || "Título do artigo"}
              </p>
              <p className="text-xs text-[#006621] dark:text-emerald-400 truncate">
                mavox.com.br › blog › {form.slug || "slug"}
              </p>
              <p className="text-xs text-[#545454] dark:text-[#94a3b8] line-clamp-2 mt-0.5">
                {form.meta_description || form.excerpt || previewExcerpt}
              </p>
            </div>

            {fieldError?.field && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-3">{fieldError.error}</p>
            )}
          </div>

          {mode === "edit" && (
            <div className="flex items-start gap-2 text-xs text-[#64748b] dark:text-[#94a3b8] px-1">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              Última atualização:{""}
              {form.published_at_iso
                ? formatZonedDateTime(form.published_at_iso, form.scheduled_timezone)
                : "—"}
            </div>
          )}
        </aside>
      </div>
    </form>
  );
}
