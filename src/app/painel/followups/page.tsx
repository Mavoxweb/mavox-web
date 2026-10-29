"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Trash2, Edit, MessageSquare, ExternalLink } from "lucide-react";

interface Followup {
  id: string;
  quote_id: string;
  quoteCode?: string | null;
  clientName?: string | null;
  clientPhone?: string | null;
  stage: string;
  message: string;
  sent_at: string | null;
  channel: string;
  created_at?: string;
}

const STAGE_OPTIONS = [
  { value: "", label: "Todos os Estágios" },
  { value: "novo", label: "Novo" },
  { value: "em_analise", label: "Em Análise" },
  { value: "proposta_enviada", label: "Proposta Enviada" },
  { value: "aprovado", label: "Aprovado" },
  { value: "recusado", label: "Recusado" },
  { value: "expirado", label: "Expirado" },
];

export default function FollowupsPage() {
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [quotes, setQuotes] = useState<{ id: string; code: string; clientName?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingFollowup, setEditingFollowup] = useState<Followup | null>(null);
  const [formData, setFormData] = useState({
    quote_id: "",
    stage: "",
    message: "",
    channel: "whatsapp",
  });
  const [error, setError] = useState("");

  const fetchFollowups = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "100");
      if (stageFilter) params.set("stage", stageFilter);

      const res = await fetch(`/api/painel/followups?${params.toString()}`);
      const data = await res.json();
      setFollowups(data.data || []);
    } catch (err) {
      console.error("Erro ao buscar follow-ups:", err);
    } finally {
      setLoading(false);
    }
  }, [stageFilter]);

  const fetchQuotes = useCallback(async () => {
    try {
      const res = await fetch("/api/painel/quotes?limit=50");
      const data = await res.json();
      setQuotes(data.data || []);
    } catch (err) {
      console.error("Erro ao buscar orçamentos para select:", err);
    }
  }, []);

  useEffect(() => {
    fetchFollowups();
    fetchQuotes();
  }, [fetchFollowups, fetchQuotes]);

  const handleOpenModal = (followup?: Followup) => {
    if (followup) {
      setEditingFollowup(followup);
      setFormData({
        quote_id: followup.quoteCode || followup.quote_id,
        stage: followup.stage,
        message: followup.message,
        channel: followup.channel || "whatsapp",
      });
    } else {
      setEditingFollowup(null);
      setFormData({
        quote_id: "",
        stage: "proposta_enviada",
        message: "",
        channel: "whatsapp",
      });
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
      const url = editingFollowup
        ? `/api/painel/followups/${editingFollowup.id}`
        : "/api/painel/followups";
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
    } catch (err) {
      setError("Erro ao salvar follow-up");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta mensagem de follow-up?")) return;
    try {
      const res = await fetch(`/api/painel/followups/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir");
      fetchFollowups();
    } catch (err) {
      console.error("Erro ao excluir follow-up:", err);
    }
  };

  const handleOpenWhatsApp = (followup: Followup) => {
    if (!followup.clientPhone) {
      alert("Este cliente não possui telefone cadastrado.");
      return;
    }
    const cleanPhone = followup.clientPhone.replace(/\D/g, "");
    const encoded = encodeURIComponent(followup.message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--tx)" }}>
            Mensagens de Follow-up
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--mu)" }}>
            Padronize e envie mensagens personalizadas de recuperação e contato por estágio do funil.
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="painel-btn pr">
          <Plus className="w-4 h-4" />
          Nova Mensagem
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3">
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="painel-btn text-xs py-2 px-3 outline-none"
        >
          {STAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="painel-c">
        {loading ? (
          <div className="py-12 text-center text-xs" style={{ color: "var(--mu)" }}>
            Carregando mensagens...
          </div>
        ) : followups.length === 0 ? (
          <div className="py-12 text-center text-xs" style={{ color: "var(--mu)" }}>
            Nenhum follow-up cadastrado para este estágio.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b" style={{ borderColor: "var(--bd)", color: "var(--mu)" }}>
                <tr>
                  <th className="py-3 px-4 font-semibold">Orçamento / Cliente</th>
                  <th className="py-3 px-4 font-semibold">Estágio</th>
                  <th className="py-3 px-4 font-semibold">Mensagem</th>
                  <th className="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--bd)" }}>
                {followups.map((f) => (
                  <tr key={f.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-sm" style={{ color: "var(--tx)" }}>
                        {f.quoteCode || "Orçamento Vinculado"}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--mu)" }}>
                        {f.clientName || "Lead do sistema"} {f.clientPhone ? `• ${f.clientPhone}` : ""}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="painel-pill up uppercase text-[10px]">
                        {f.stage.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-md">
                      <p className="text-xs line-clamp-2" style={{ color: "var(--tx)" }}>
                        {f.message}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {f.clientPhone && (
                          <button
                            onClick={() => handleOpenWhatsApp(f)}
                            className="painel-btn text-[11px] py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                            title="Disparar no WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            WhatsApp
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenModal(f)}
                          className="painel-ib !w-7 !h-7"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(f.id)}
                          className="painel-ib !w-7 !h-7 text-red-500 hover:text-red-700"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="painel-c max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--tx)" }}>
              {editingFollowup ? "Editar Follow-up" : "Novo Follow-up"}
            </h3>

            {error && (
              <div className="mb-4 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 p-3 rounded-lg border border-red-200 dark:border-red-900/50">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--tx)" }}>
                  Orçamento Alvo (Selecione ou digite o código) *
                </label>
                <div className="space-y-2">
                  <select
                    value={formData.quote_id}
                    onChange={(e) => setFormData({ ...formData, quote_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg outline-none"
                    style={{ borderColor: "var(--bd)", background: "var(--side)" }}
                  >
                    <option value="">Selecione um orçamento recente...</option>
                    {quotes.map((q) => (
                      <option key={q.id} value={q.code}>
                        {q.code} {q.clientName ? `- ${q.clientName}` : ""}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Ou digite o código manual (Ex: MVX-2026-0001)"
                    value={formData.quote_id}
                    onChange={(e) => setFormData({ ...formData, quote_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs border rounded-lg outline-none"
                    style={{ borderColor: "var(--bd)", background: "var(--side)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--tx)" }}>
                  Estágio do Funil *
                </label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none"
                  style={{ borderColor: "var(--bd)", background: "var(--side)" }}
                >
                  <option value="novo">Novo</option>
                  <option value="em_analise">Em Análise</option>
                  <option value="proposta_enviada">Proposta Enviada</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="recusado">Recusado</option>
                  <option value="expirado">Expirado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--tx)" }}>
                  Mensagem Personalizada *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Olá! Passando para checar se você conseguiu avaliar a proposta que enviamos..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none"
                  style={{ borderColor: "var(--bd)", background: "var(--side)" }}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: "var(--bd)" }}>
                <button type="button" onClick={handleCloseModal} className="painel-btn">
                  Cancelar
                </button>
                <button type="submit" className="painel-btn pr">
                  {editingFollowup ? "Atualizar" : "Salvar Follow-up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
