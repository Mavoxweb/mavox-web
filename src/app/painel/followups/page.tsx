"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Trash2, Edit, MessageSquare, Filter, ChevronDown } from "lucide-react";
import Link from "next/link";

interface Followup {
  id: string;
  quote_id: string;
  stage: string;
  message: string;
  sent_at: string | null;
  channel: string;
  created_at: string;
}

const STAGE_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "novo", label: "Novo" },
  { value: "em_analise", label: "Em Análise" },
  { value: "proposta_enviada", label: "Proposta Enviada" },
  { value: "aprovado", label: "Aprovado" },
  { value: "recusado", label: "Recusado" },
  { value: "expirado", label: "Expirado" },
];

export default function FollowupsPage() {
  const router = useRouter();
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingFollowup, setEditingFollowup] = useState<Followup | null>(null);
  const [formData, setFormData] = useState({ quote_id: "", stage: "", message: "", channel: "whatsapp" });
  const [error, setError] = useState("");

  const fetchFollowups = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "50");
      if (stageFilter) params.set("stage", stageFilter);

      const res = await fetch(`/api/painel/followups?${params.toString()}`);
      const data = await res.json();
      setFollowups(data.data);
    } catch (error) {
      console.error("Erro ao buscar follow-ups:", error);
    } finally {
      setLoading(false);
    }
  }, [stageFilter]);

  useEffect(() => {
    fetchFollowups();
  }, [fetchFollowups]);

  const handleOpenModal = (followup?: Followup) => {
    if (followup) {
      setEditingFollowup(followup);
      setFormData({ quote_id: followup.quote_id, stage: followup.stage, message: followup.message, channel: followup.channel });
    } else {
      setEditingFollowup(null);
      setFormData({ quote_id: "", stage: "", message: "", channel: "whatsapp" });
    }
    setShowModal(true);
    setError("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFollowup(null);
    setFormData({ quote_id: "", stage: "", message: "", channel: "whatsapp" });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const url = editingFollowup ? `/api/painel/followups/${editingFollowup.id}` : "/api/painel/followups";
      const method = editingFollowup ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao salvar");
        return;
      }

      handleCloseModal();
      fetchFollowups();
    } catch (error) {
      setError("Erro ao salvar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este follow-up?")) return;
    try {
      const res = await fetch(`/api/painel/followups/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir");
      fetchFollowups();
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      novo: "Novo",
      em_analise: "Em Análise",
      proposta_enviada: "Proposta Enviada",
      aprovado: "Aprovado",
      recusado: "Recusado",
      expirado: "Expirado",
    };
    return labels[stage] || stage;
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "novo": return "bg-blue-100 text-blue-800";
      case "em_analise": return "bg-yellow-100 text-yellow-800";
      case "proposta_enviada": return "bg-purple-100 text-purple-800";
      case "aprovado": return "bg-green-100 text-green-800";
      case "recusado": return "bg-red-100 text-red-800";
      case "expirado": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Follow-ups Automatizados</h1>
          <p className="text-gray-600 mt-1">Configure mensagens automáticas por estágio do funil</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Follow-up
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <form className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por mensagem..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
            <div className="mt-4 flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estágio</label>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-[180px]"
                >
                  {STAGE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </form>

        {loading ? (
          <div className="p-8 text-center animate-pulse text-gray-400">Carregando...</div>
        ) : followups.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhum follow-up configurado</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {followups.map(followup => (
              <li key={followup.id} className="px-4 py-4 flex items-start justify-between hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(followup.stage)}`}>
                      {getStageLabel(followup.stage)}
                    </span>
                    <span className="text-sm text-gray-500">Canal: {followup.channel}</span>
                    {followup.quote_id && (
                      <Link href={`/painel/quotes/${followup.quote_id}`} className="text-sm text-blue-600 hover:text-blue-700 font-mono">
                        {followup.quote_id}
                      </Link>
                    )}
                  </div>
                  <p className="text-gray-700">{followup.message}</p>
                  {followup.sent_at && (
                    <p className="text-xs text-gray-400 mt-1">Enviado em: {new Date(followup.sent_at).toLocaleString("pt-BR")}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(followup)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(followup.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingFollowup ? "Editar Follow-up" : "Novo Follow-up"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código do Orçamento</label>
                  <input
                    type="text"
                    value={formData.quote_id}
                    onChange={(e) => setFormData({ ...formData, quote_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Ex: MVX-2026-0001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estágio do Funil *</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">Selecione...</option>
                    <option value="novo">Novo</option>
                    <option value="em_analise">Em Análise</option>
                    <option value="proposta_enviada">Proposta Enviada</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="recusado">Recusado</option>
                    <option value="expirado">Expirado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Mensagem a ser enviada (use variáveis como {nome}, {codigo_orcamento})"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Canal</label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="whatsapp">WhatsApp (wa.me)</option>
                    <option value="email">E-mail</option>
                  </select>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingFollowup ? "Salvar" : "Criar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}