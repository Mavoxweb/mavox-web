"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, ChevronDown, Edit, Trash2, FileText, Calendar, Zap, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  published_at: string | null;
  ai_generated: boolean;
  cover_image?: string | null;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "draft", label: "Rascunho" },
  { value: "published", label: "Publicado" },
  { value: "scheduled", label: "Agendado" },
];

const STATUS_CONFIG = {
  draft: { label: "Rascunho", bg: "rgba(148,163,184,0.15)", text: "rgb(148,163,184)", icon: FileText },
  published: { label: "Publicado", bg: "rgba(34,197,94,0.15)", text: "rgb(34,197,94)", icon: Eye },
  scheduled: { label: "Agendado", bg: "rgba(59,130,246,0.15)", text: "rgb(59,130,246)", icon: Calendar },
};

export default function BlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "50");
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/painel/blog?${params.toString()}`);
      const data = await res.json();
      setPosts(data.data || []);
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
      toast.error("Falha ao carregar artigos");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este artigo? Esta ação não pode ser desfeita.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/painel/blog/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir");
      toast.success("Artigo excluído");
      fetchPosts();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error("Falha ao excluir artigo");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(search.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <style jsx>{`
        .blog-dashboard {
          --surface: rgb(255 255 255);
          --surface-elevated: rgb(248 250 252);
          --border: rgb(226 232 240);
          --text: rgb(15 23 42);
          --text-muted: rgb(100 116 139);
          --accent: rgb(37 99 235);
          --accent-soft: rgba(37,99,235,0.1);
        }
        :global(html.dark) .blog-dashboard {
          --surface: rgb(30 41 59);
          --surface-elevated: rgb(51 65 85);
          --border: rgb(51 65 85);
          --text: rgb(241 245 249);
          --text-muted: rgb(148 163 184);
          --accent: rgb(96 165 250);
          --accent-soft: rgba(96,165,250,0.15);
        }
        .blog-dashboard {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .table-row { transition: background 0.15s ease; }
        .table-row:hover { background: var(--surface-elevated); }
        .action-btn { transition: all 0.15s ease; }
        .action-btn:hover { transform: scale(1.1); }
        .status-badge { transition: all 0.15s ease; }
        @media (prefers-reduced-motion: reduce) {
          .table-row, .action-btn, .status-badge { transition: none !important; }
          .action-btn:hover { transform: none !important; }
        }
      `}</style>

      <div className="blog-dashboard">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: "var(--text)", letterSpacing: "-0.02em" }}>
              Blog
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Gerencie artigos e conteúdo com IA</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/painel/blog/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              style={{ background: "var(--accent)", color: "white" }}
            >
              <Plus className="w-4 h-4" />
              Novo Artigo
            </Link>
            <Link
              href="/painel/blog/new?ai=true"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              style={{ background: "rgb(139,92,246)", color: "white" }}
            >
              <Zap className="w-4 h-4" />
              Gerar com IA
            </Link>
          </div>
        </div>

        {/* Search & Filters Card */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <form onSubmit={handleSearch} className="p-4 sm:p-5 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--text-muted)" }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por título ou resumo..."
                  className="w-full pl-11 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-offset-0 outline-none transition-all duration-150"
                  style={{
                    background: "var(--surface-elevated)",
                    borderColor: "var(--border)",
                    color: "var(--text)",
                    "--focus-ring-color": "var(--accent)",
                  } as React.CSSProperties}
                />
              </div>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 px-4 py-2.5 border rounded-xl font-medium transition-all duration-150"
                style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--surface-elevated)" }}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtros</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`} />
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 flex flex-wrap items-end gap-4" style={{ animation: "slideDown 0.2s ease-out" }}>
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-muted)" }}>Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-offset-0 outline-none transition-all duration-150"
                    style={{
                      background: "var(--surface-elevated)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                      "--focus-ring-color": "var(--accent)",
                    } as React.CSSProperties}
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  style={{ background: "var(--accent)", color: "white" }}
                >
                  Aplicar
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Table */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: "var(--accent)" }} />
              <p style={{ color: "var(--text-muted)" }}>Carregando artigos...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)", opacity: 0.5 }} />
              <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text)" }}>Nenhum artigo encontrado</h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {search || statusFilter ? "Tente ajustar seus filtros de busca." : "Comece criando seu primeiro artigo."}
              </p>
              {!search && !statusFilter && (
                <Link
                  href="/painel/blog/new"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200"
                  style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                >
                  <Plus className="w-4 h-4" />
                  Criar artigo
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" role="grid">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                    <th className="px-4 sm:px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                      Artigo
                    </th>
                    <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: "var(--text-muted)" }}>
                      Capa
                    </th>
                    <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                      Status
                    </th>
                    <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider hidden lg:table-cell" style={{ color: "var(--text-muted)" }}>
                      IA
                    </th>
                    <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                      Publicado
                    </th>
                    <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider hidden xl:table-cell" style={{ color: "var(--text-muted)" }}>
                      Criado
                    </th>
                    <th className="px-4 sm:px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map(post => {
                    const config = STATUS_CONFIG[post.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
                    const StatusIcon = config.icon;

                    return (
                      <tr key={post.id} className="table-row border-b" style={{ borderColor: "var(--border)" }}>
                        <td className="px-4 sm:px-6 py-4">
                          <Link href={`/painel/blog/${post.id}`} className="font-medium transition-colors duration-150" style={{ color: "var(--text)" }}>
                            {post.title}
                          </Link>
                          {post.excerpt && <p className="mt-1 text-sm line-clamp-1 truncate max-w-xs" style={{ color: "var(--text-muted)" }}>{post.excerpt}</p>}
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          {post.cover_image ? (
                            <Link href={`/painel/blog/${post.id}`} className="block w-16 h-10 rounded-lg overflow-hidden transition-transform duration-200 hover:scale-105" style={{ borderColor: "var(--border)" }}>
                              <img src={post.cover_image} alt="" className="w-full h-full object-cover" loading="lazy" />
                            </Link>
                          ) : (
                            <div className="w-16 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--surface-elevated)", border: "1px dashed var(--border)" }}>
                              <FileText className="w-5 h-5" style={{ color: "var(--text-muted)", opacity: 0.5 }} />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="status-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium" style={{ background: config.bg, color: config.text }}>
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          {post.ai_generated ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium" style={{ background: "rgba(139,92,246,0.15)", color: "rgb(167,139,250)" }}>
                              <Zap className="w-3 h-3" />
                              IA
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm" style={{ color: "var(--text-muted)" }}>
                          {post.published_at ? new Date(post.published_at).toLocaleDateString("pt-BR") : "—"}
                        </td>
                        <td className="px-4 py-4 text-sm hidden xl:table-cell" style={{ color: "var(--text-muted)" }}>
                          {new Date(post.created_at).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/painel/blog/${post.id}`}
                              className="action-btn p-2 rounded-lg transition-all duration-150"
                              style={{ color: "var(--text-muted)", background: "transparent" }}
                              title="Editar"
                              aria-label="Editar artigo"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="action-btn p-2 rounded-lg transition-all duration-150"
                              style={{ color: "var(--text-muted)", background: "transparent" }}
                              title="Ver no site"
                              aria-label="Visualizar no site"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(post.id)}
                              disabled={deletingId === post.id}
                              className="action-btn p-2 rounded-lg transition-all duration-150"
                              style={{ color: "var(--text-muted)", background: "transparent" }}
                              title="Excluir"
                              aria-label="Excluir artigo"
                            >
                              {deletingId === post.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" style={{ color: "rgb(239,68,68)" }} />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}