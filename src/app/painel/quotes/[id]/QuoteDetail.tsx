"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Edit,
  Trash2,
  Save,
  Phone,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";

interface Quote {
  id: string;
  code: string;
  lead_id: string;
  status: string;
  briefing: string | null;
  budget_range: string | null;
  deadline_pref: string | null;
  total: number | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string | null;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  clientCompany: string | null;
}

interface QuoteItem {
  id: string;
  quote_id: string;
  service_id: string | null;
  description: string;
  quantity: number;
  unit_price: number | null;
  position: number;
  serviceName: string | null;
}

interface QuoteEvent {
  id: string;
  quote_id: string;
  type: string;
  data: string | null;
  created_at: string;
}

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
}

export function QuoteDetail({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [events, setEvents] = useState<QuoteEvent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [proposalToken, setProposalToken] = useState<string | null>(null);

  // Estado do modal de adicionar item
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({
    description: "",
    quantity: 1,
    unit_price: 0,
  });
  const fetchData = async () => {
    setLoading(true);
    try {
      const [quoteRes, itemsRes, eventsRes, clientsRes] = await Promise.all([
        fetch(`/api/painel/quotes/${quoteId}`),
        fetch(`/api/painel/quotes/${quoteId}/items`),
        fetch(`/api/painel/quotes/${quoteId}/events`),
        fetch("/api/painel/clients?limit=100"),
      ]);

      if (!quoteRes.ok) throw new Error("Orçamento não encontrado");

      const quoteData = await quoteRes.json();
      const itemsData = await itemsRes.json();
      const eventsData = await eventsRes.json();
      const clientsData = (await clientsRes.json()) as any;

      setQuote({
        ...quoteData,
        clientName: quoteData.clientName || "Cliente não informado",
        clientEmail: quoteData.clientEmail || "",
        clientPhone: quoteData.clientPhone || null,
        clientCompany: quoteData.clientCompany || null,
      });
      setItems(itemsData.data || itemsData || []);
      setEvents(eventsData.data || eventsData || []);
      setClients(clientsData.data || clientsData || []);

      // Buscar public_token da proposta mais recente
      const proposalRes = await fetch(`/api/painel/quotes/${quoteId}/proposals`);
      if (proposalRes.ok) {
        const proposalData = await proposalRes.json();
        const proposals = proposalData.data || proposalData || [];
        if (proposals.length > 0) {
          setProposalToken(proposals[0].public_token || null);
        }
      }
    } catch (err) {
      setError("Erro ao carregar orçamento");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [quoteId]);

  const fetchItems = async () => {
    const res = await fetch(`/api/painel/quotes/${quoteId}/items`);
    if (res.ok) {
      const data = await res.json();
      setItems(data.data || data || []);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.description.trim()) return;
    setAddingItem(true);
    setError("");
    try {
      const res = await fetch(`/api/painel/quotes/${quoteId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: newItem.description,
          quantity: newItem.quantity,
          unit_price: newItem.unit_price,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao adicionar item");
      }
      const data = await res.json();
      // Atualiza total local
      if (data.total !== undefined) {
        setQuote(prev => prev ? { ...prev, total: data.total } : null);
      }
      await fetchItems();
      setNewItem({ description: "", quantity: 1, unit_price: 0 });
      setShowAddItemModal(false);
    } catch (err: any) {
      setError(err.message || "Erro ao adicionar item");
    } finally {
      setAddingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Remover este item?")) return;
    try {
      const res = await fetch(`/api/painel/quotes/${quoteId}/items?itemId=${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao remover item");
      const data = await res.json();
      if (data.total !== undefined) {
        setQuote(prev => prev ? { ...prev, total: data.total } : null);
      }
      await fetchItems();
    } catch (err) {
      setError("Erro ao remover item");
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      novo: "Novo",
      em_analise: "Em Análise",
      proposta_enviada: "Proposta Enviada",
      aprovado: "Aprovado",
      recusado: "Recusado",
      expirado: "Expirado",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "novo": return "bg-blue-100 text-blue-800";
      case "em_analise": return "bg-yellow-100 text-yellow-800";
      case "proposta_enviada": return "bg-purple-100 text-purple-800";
      case "aprovado": return "bg-green-100 text-green-800";
      case "recusado": return "bg-red-100 text-red-800";
      case "expirado": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!quote) return;
    try {
      const res = await fetch(`/api/painel/quotes/${quoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar status");

      setQuote(prev => prev ? { ...prev, status: newStatus } : null);
      fetchData();
    } catch (err) {
      setError("Erro ao alterar status do orçamento");
    }
  };

  const handleSave = async () => {
    if (!quote) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/painel/quotes/${quoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: quote.status,
          total: quote.total || 0,
          items: items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price || 0,
            serviceId: item.service_id || null,
          })),
        }),
      });

      if (!res.ok) throw new Error("Erro ao salvar");

      setSaving(false);
    } catch (err) {
      setError("Erro ao salvar orçamento");
      setSaving(false);
    }
  };

  const handleSendWhatsApp = () => {
    if (!quote) return;
    const token = proposalToken || quote.id;
    const message = encodeURIComponent(
      `Olá! Sua proposta MVX-${quote.code} está disponível para revisão.\n\n` +
      `Acesse: ${window.location.origin}/proposta/${token}\n\n` +
      `Mavox - Desenvolvimento Web`
    );
    window.open(`https://wa.me/${quote.clientPhone?.replace(/\D/g, "")}?text=${message}`, "_blank");
  };

  const handleOpenProposal = () => {
    if (!quote) return;
    const token = proposalToken || quote.id;
    window.open(`/proposta/${token}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <XCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-medium text-gray-900">{error || "Orçamento não encontrado"}</h2>
        <Link
          href="/painel/quotes"
          className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
        >
          Voltar para lista de orçamentos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/painel/quotes" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orçamento {quote.code}</h1>
            <p className="text-gray-600 mt-1">Detalhes e gerenciamento da proposta</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Salvar
          </button>
          <button
            onClick={handleOpenProposal}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            title="Abrir proposta pública"
          >
            <ExternalLink className="w-4 h-4" />
            Proposta Pública
          </button>
          <button
            onClick={handleSendWhatsApp}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            title="Enviar WhatsApp"
          >
            <Phone className="w-4 h-4" />
            WhatsApp
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Quote Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Metadata */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status e Metadados</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                  {getStatusLabel(quote.status)}
                </span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Código</p>
                <p className="font-mono font-semibold text-gray-900">{quote.code}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</p>
                <p className="font-semibold text-gray-900">
                  {quote.total ? `R$ ${Number(quote.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "Não informado"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Briefing</p>
                <p className="text-gray-600">{quote.briefing || "Não informado"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Orçamento do Cliente</p>
                <p className="text-gray-600">{getBudgetLabel(quote.budget_range)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Prazo Preferido</p>
                <p className="text-gray-600">{getDeadlineLabel(quote.deadline_pref)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Validade</p>
                <p className="text-gray-600">{quote.valid_until ? new Date(quote.valid_until).toLocaleDateString("pt-BR") : "Não definido"}</p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Alterar Status</label>
              <select
                value={quote.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="novo">Novo</option>
                <option value="em_analise">Em Análise</option>
                <option value="proposta_enviada">Proposta Enviada</option>
                <option value="aprovado">Aprovado</option>
                <option value="recusado">Recusado</option>
                <option value="expirado">Expirado</option>
              </select>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Itens do Orçamento</h2>
              <button
                onClick={() => setShowAddItemModal(true)}
                className="px-3 py-2 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unitário</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        Nenhum item adicionado
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[newItems.findIndex(i => i.id === item.id)].description = e.target.value;
                              setItems(newItems);
                            }}
                            className="w-full text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-transparent outline-none"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {item.serviceName || "Não especificado"}
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...items];
                              const idx = newItems.findIndex(i => i.id === item.id);
                              newItems[idx].quantity = parseInt(e.target.value) || 1;
                              setItems(newItems);
                            }}
                            className="w-full text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-transparent outline-none text-right"
                          />
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          {item.unit_price ? `R$ ${Number(item.unit_price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "R$ 0,00"}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium">
                          R$ {Number((item.unit_price || 0) * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-900">
                      Total:
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-600">
                      R$ {Number(quote.total || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Client & Events */}
        <div className="lg:col-span-1 space-y-6">
          {/* Client Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cliente</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">{quote.clientName}</span>
                  <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded">{quote.clientCompany || "Sem empresa"}</span>
                </div>
              {quote.clientEmail && (
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></span>
                  <span className="text-sm text-gray-600">{quote.clientEmail}</span>
                </div>
              )}
              {quote.clientPhone && (
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></span>
                  <span className="text-sm text-gray-600">{quote.clientPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Events Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Linha do Tempo</h2>
            {events.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Sem eventos registrados</p>
            ) : (
              <div className="space-y-4">
                {events.map(event => (
                  <div key={event.id} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-300 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{event.type.replace(/_/g, " ").toUpperCase()}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{event.data ? JSON.parse(event.data).status || "Evento" : "Evento"}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(event.created_at).toLocaleString("pt-BR")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
            <div className="space-y-3">
              <button
                onClick={handleSendWhatsApp}
                className="w-full flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
              >
                <Phone className="w-5 h-5" />
                Enviar Proposta por WhatsApp
              </button>
              <button
                onClick={handleOpenProposal}
                className="w-full flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <ExternalLink className="w-5 h-5" />
                Abrir Proposta Pública
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAddItemModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Novo Item do Orçamento</h3>
            <form onSubmit={handleAddItem} className="space-y-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Desenvolvimento de landing page"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Unitário (R$) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={newItem.unit_price}
                    onChange={(e) => setNewItem({ ...newItem, unit_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={addingItem}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {addingItem ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adicionando...
                    </>
                  ) : (
                    "Adicionar Item"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function getBudgetLabel(range: string | null) {
  const labels: Record<string, string> = {
    "ate-3k": "Até R$ 3 mil",
    "3k-8k": "R$ 3 mil a R$ 8 mil",
    "8k-20k": "R$ 8 mil a R$ 20 mil",
    "acima-20k": "Acima de R$ 20 mil",
    "nao-sei": "Ainda não sei",
  };
  return range ? labels[range] : "Não informado";
}

function getDeadlineLabel(deadline: string | null) {
  const labels: Record<string, string> = {
    urgente: "O quanto antes",
    "30-dias": "Em até 30 dias",
    "sem-pressa": "Sem pressa",
  };
  return deadline ? labels[deadline] : "Não informado";
}