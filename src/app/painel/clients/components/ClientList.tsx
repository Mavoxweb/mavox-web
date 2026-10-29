"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, ChevronDown, MessageCircle, Globe } from "lucide-react";
import Link from "next/link";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: string;
  intent: string;
  category: string | null;
  niche: string | null;
  tier: string | null;
  tier_label: string | null;
  city: string | null;
  state: string | null;
  neighborhood: string | null;
  website: string | null;
  website_type: string | null;
  whatsapp_status: string | null;
  instagram_handle: string | null;
  instagram_followers: number | null;
  google_reviews: number | null;
  google_rating: string | number | null;
  offer_code: string | null;
  recommended_service: string | null;
  created_at: string;
  tags: { id: string; name: string; color: string }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Facets {
  categories: string[];
  cities: string[];
}

const WEBSITE_LABELS: Record<string, string> = {
  nosite: "Sem site",
  igonly: "Só Instagram",
  link: "Só link",
  template: "Template",
  site_ig: "Site + Instagram",
  site_noig: "Site sem Instagram",
};

const WEBSITE_COLORS: Record<string, string> = {
  nosite: "bg-red-50 text-red-700",
  igonly: "bg-orange-50 text-orange-700",
  link: "bg-amber-50 text-amber-700",
  template: "bg-yellow-50 text-yellow-700",
  site_ig: "bg-emerald-50 text-emerald-700",
  site_noig: "bg-sky-50 text-sky-700",
};

export function ClientList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [facets, setFacets] = useState<Facets>({ categories: [], cities: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams?.get("search") || "");
  const [sourceFilter, setSourceFilter] = useState(searchParams?.get("source") || "");
  const [tierFilter, setTierFilter] = useState(searchParams?.get("tier") || "");
  const [categoryFilter, setCategoryFilter] = useState(searchParams?.get("category") || "");
  const [websiteFilter, setWebsiteFilter] = useState(searchParams?.get("websiteType") || "");
  const [whatsappFilter, setWhatsappFilter] = useState(searchParams?.get("whatsapp") || "");
  const [tagFilter, setTagFilter] = useState(searchParams?.get("tag") || "");
  const [tags, setTags] = useState<{ id: string; name: string; color: string }[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const activeFilters = [sourceFilter, tierFilter, categoryFilter, websiteFilter, whatsappFilter, tagFilter]
    .filter(Boolean).length;

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(pagination.page));
    params.set("limit", String(pagination.limit));
    if (search) params.set("search", search);
    if (sourceFilter) params.set("source", sourceFilter);
    if (tierFilter) params.set("tier", tierFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    if (websiteFilter) params.set("websiteType", websiteFilter);
    if (whatsappFilter) params.set("whatsapp", whatsappFilter);
    if (tagFilter) params.set("tag", tagFilter);

    try {
      const res = await fetch(`/api/painel/clients?${params.toString()}`, { credentials: 'include' });
      const data = await res.json();
      setClients(data.data);
      setPagination(data.pagination);
      if (data.facets) setFacets(data.facets);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, sourceFilter, tierFilter, categoryFilter, websiteFilter, whatsappFilter, tagFilter]);

  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch("/api/painel/tags?limit=50", { credentials: 'include' });
      const data = await res.json();
      setTags(data.data);
    } catch (error) {
      console.error("Erro ao buscar tags:", error);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const syncUrl = (page: number) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (search) params.set("search", search);
    if (sourceFilter) params.set("source", sourceFilter);
    if (tierFilter) params.set("tier", tierFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    if (websiteFilter) params.set("websiteType", websiteFilter);
    if (whatsappFilter) params.set("whatsapp", whatsappFilter);
    if (tagFilter) params.set("tag", tagFilter);
    router.push(`/painel/clients?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    syncUrl(1);
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    syncUrl(newPage);
  };

  const clearFilters = () => {
    setSourceFilter("");
    setTierFilter("");
    setCategoryFilter("");
    setWebsiteFilter("");
    setWhatsappFilter("");
    setTagFilter("");
    setSearch("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "site": return "Site";
      case "apify": return "Apify";
      case "xlsx": return "Planilha";
      case "manual": return "Manual";
      default: return source;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case "site": return "bg-green-100 text-green-800";
      case "apify": return "bg-violet-100 text-violet-800";
      case "xlsx": return "bg-purple-100 text-purple-800";
      case "manual": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getIntentLabel = (intent: string) => {
    switch (intent) {
      case "conhecer": return "Conhecer";
      case "avaliando": return "Avaliando";
      case "pronto_para_contratar": return "Pronto para Contratar";
      case "prospect": return "Prospect";
      default: return intent;
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case "conhecer": return "bg-gray-100 text-gray-800";
      case "avaliando": return "bg-yellow-100 text-yellow-800";
      case "pronto_para_contratar": return "bg-green-100 text-green-800";
      case "prospect": return "bg-indigo-100 text-indigo-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Search and Filters */}
      <form onSubmit={handleSearch} className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, telefone, categoria ou bairro..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span className="text-sm font-medium text-gray-700">
              Filtros{activeFilters > 0 ? ` (${activeFilters})` : ""}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Buscar
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origem</label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Todas</option>
                <option value="apify">Apify</option>
                <option value="site">Site</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Faixa</label>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Todas</option>
                <option value="A">A – Site (R$ 400+)</option>
                <option value="B">B – Recorrente (R$ 1.500+/mês)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Todas</option>
                {facets.categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Perfil digital</label>
              <select
                value={websiteFilter}
                onChange={(e) => setWebsiteFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Todos</option>
                {Object.entries(WEBSITE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <select
                value={whatsappFilter}
                onChange={(e) => setWhatsappFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Todos</option>
                <option value="confirmado">Confirmado</option>
                <option value="sem_whatsapp">Não identificado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Intenção</label>
              <select
                value={searchParams?.get("intent") || ""}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams?.toString() || "");
                  if (e.target.value) params.set("intent", e.target.value);
                  else params.delete("intent");
                  router.push(`/painel/clients?${params.toString()}`);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Todas</option>
                <option value="prospect">Prospect</option>
                <option value="conhecer">Conhecer</option>
                <option value="avaliando">Avaliando</option>
                <option value="pronto_para_contratar">Pronto para Contratar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Todas</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Aplicar
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
              >
                Limpar
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Clients Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faixa</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil digital</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Carregando...
                  </div>
                </td>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Nenhum cliente encontrado</td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/painel/clients/${client.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                        {client.name}
                      </Link>
                      {client.whatsapp_status === "confirmado" && (
                        <span title="WhatsApp confirmado"><MessageCircle className="w-4 h-4 text-green-500" /></span>
                      )}
                    </div>
                    {(client.category || client.niche) && (
                      <p className="text-sm text-gray-600">
                        {[client.category, client.niche].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {client.phone && <p className="text-xs text-gray-400">{client.phone}</p>}
                    {client.email && <p className="text-xs text-gray-400">{client.email}</p>}
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSourceColor(client.source)}`}>
                        {getSourceLabel(client.source)}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getIntentColor(client.intent)}`}>
                        {getIntentLabel(client.intent)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {client.city ? (
                      <>
                        <p>{client.city}{client.state ? `/${client.state}` : ""}</p>
                        {client.neighborhood && <p className="text-xs text-gray-400">{client.neighborhood}</p>}
                      </>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {client.tier ? (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          client.tier === "A" ? "bg-sky-100 text-sky-800" : "bg-amber-100 text-amber-800"
                        }`}
                        title={client.tier_label || undefined}
                      >
                        {client.tier} · {client.tier === "A" ? "Site" : "Recorrente"}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                    {client.recommended_service && (
                      <p className="text-xs text-gray-500 mt-1 max-w-[180px]">{client.recommended_service}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {client.website_type ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${WEBSITE_COLORS[client.website_type] || "bg-gray-100 text-gray-700"}`}>
                        <Globe className="w-3 h-3" />
                        {WEBSITE_LABELS[client.website_type] || client.website_type}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                    <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                      {client.instagram_followers !== null && (
                        <p>IG {client.instagram_followers.toLocaleString("pt-BR")}</p>
                      )}
                      {client.google_reviews !== null && (
                        <p>
                          Google {client.google_rating ?? "—"} · {client.google_reviews} aval.
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {client.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                        >
                          {tag.name}
                        </span>
                      ))}
                      {client.tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-gray-500 bg-gray-100">
                          +{client.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/painel/clients/${client.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Ver detalhes
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} clientes
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
