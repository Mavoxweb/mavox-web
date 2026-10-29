"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, ChevronDown } from "lucide-react";
import Link from "next/link";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  source: string;
  intent: string;
  created_at: string;
  tags: { id: string; name: string; color: string }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function ClientList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams?.get("search") || "");
  const [sourceFilter, setSourceFilter] = useState(searchParams?.get("source") || "");
  const [intentFilter, setIntentFilter] = useState(searchParams?.get("intent") || "");
  const [tagFilter, setTagFilter] = useState(searchParams?.get("tag") || "");
  const [tags, setTags] = useState<{ id: string; name: string; color: string }[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(pagination.page));
    params.set("limit", String(pagination.limit));
    if (search) params.set("search", search);
    if (sourceFilter) params.set("source", sourceFilter);
    if (intentFilter) params.set("intent", intentFilter);
    if (tagFilter) params.set("tag", tagFilter);

    try {
      const res = await fetch(`/api/painel/clients?${params.toString()}`, { credentials: 'include' });
      const data = await res.json();
      setClients(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, sourceFilter, intentFilter, tagFilter]);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    router.push(`/painel/clients?search=${encodeURIComponent(search)}${sourceFilter ? `&source=${sourceFilter}` : ""}${intentFilter ? `&intent=${intentFilter}` : ""}${tagFilter ? `&tag=${tagFilter}` : ""}`);
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
    router.push(`/painel/clients?page=${newPage}&search=${encodeURIComponent(search)}${sourceFilter ? `&source=${sourceFilter}` : ""}${intentFilter ? `&intent=${intentFilter}` : ""}${tagFilter ? `&tag=${tagFilter}` : ""}`);
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "site": return "Site";
      case "manual": return "Manual";
      default: return source;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case "site": return "bg-green-100 text-green-800";
      case "manual": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getIntentLabel = (intent: string) => {
    switch (intent) {
      case "conhecer": return "Conhecer";
      case "avaliando": return "Avaliando";
      case "pronto_para_contratar": return "Pronto para Contratar";
      default: return intent;
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case "conhecer": return "bg-gray-100 text-gray-800";
      case "avaliando": return "bg-yellow-100 text-yellow-800";
      case "pronto_para_contratar": return "bg-green-100 text-green-800";
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
              placeholder="Buscar por nome, e-mail ou empresa..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span className="text-sm font-medium text-gray-700">Filtros</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origem</label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Todas</option>
                <option value="site">Site</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Intenção</label>
              <select
                value={intentFilter}
                onChange={(e) => setIntentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Todas</option>
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
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Aplicar
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origem</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intenção</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cadastrado em</th>
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
                    <Link href={`/painel/clients/${client.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                      {client.name}
                    </Link>
                    <p className="text-sm text-gray-500">{client.email}</p>
                    {client.company && <p className="text-xs text-gray-400">{client.company}</p>}
                    {client.phone && <p className="text-xs text-gray-400">{client.phone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSourceColor(client.source)}`}>
                      {getSourceLabel(client.source)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getIntentColor(client.intent)}`}>
                      {getIntentLabel(client.intent)}
                    </span>
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
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(client.created_at).toLocaleDateString("pt-BR")}
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