"use client";

import { useState, useEffect } from "react";
import { Plus, Search, ChevronLeft, ChevronRight, ExternalLink, Edit, Phone, User, X } from "lucide-react";
import Link from "next/link";

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

interface Quote {
  id: string;
  code: string;
  status: string;
  briefing: string | null;
  budget_range: string | null;
  deadline_pref: string | null;
  total: number | null;
  created_at: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
}

const STATUSES = [
  { key: "novo", label: "Novo", color: "bg-blue-100 text-blue-800 border-blue-200", accent: "bg-blue-600" },
  { key: "em_analise", label: "Em Análise", color: "bg-yellow-100 text-yellow-800 border-yellow-200", accent: "bg-yellow-500" },
  { key: "proposta_enviada", label: "Proposta Enviada", color: "bg-purple-100 text-purple-800 border-purple-200", accent: "bg-purple-500" },
  { key: "aprovado", label: "Aprovado", color: "bg-green-100 text-green-800 border-green-200", accent: "bg-green-600" },
  { key: "recusado", label: "Recusado", color: "bg-red-100 text-red-800 border-red-200", accent: "bg-red-500" },
  { key: "expirado", label: "Expirado", color: "bg-slate-100 text-slate-800 border-slate-200", accent: "bg-slate-500" },
];

export function QuotesKanban() {
  const [quotes, setQuotes] = useState<Record<string, Quote[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [columnOrder, setColumnOrder] = useState(STATUSES.map(s => s.key));

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/painel/quotes?limit=200", { credentials: 'include' });
      const data = await res.json();

      const grouped: Record<string, Quote[]> = {};
      STATUSES.forEach(s => grouped[s.key] = []);

      data.data.forEach((quote: Quote) => {
        if (grouped[quote.status]) {
          grouped[quote.status].push(quote);
        }
      });

      setQuotes(grouped);
    } catch (error) {
      console.error("Erro ao buscar orçamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleDragStart = (e: React.DragEvent, quote: Quote) => {
    e.dataTransfer.setData("quote", JSON.stringify(quote));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const quoteData = JSON.parse(e.dataTransfer.getData("quote")) as Quote;

    if (quoteData.status === newStatus) return;

    try {
      const res = await fetch(`/api/painel/quotes/${quoteData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setQuotes(prev => {
          const next = { ...prev };
          next[quoteData.status] = next[quoteData.status].filter(q => q.id !== quoteData.id);
          next[newStatus] = [...next[newStatus], { ...quoteData, status: newStatus }];
          return next;
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const filteredQuotes = (statusKey: string) => {
    if (!search) return quotes[statusKey] || [];
    const term = search.toLowerCase();
    return (quotes[statusKey] || []).filter(q =>
      q.code.toLowerCase().includes(term) ||
      q.clientName.toLowerCase().includes(term) ||
      q.clientEmail.toLowerCase().includes(term)
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-8">
        {STATUSES.map(status => (
          <div key={status.key} className="bg-[#1e293b] rounded-xl p-6 min-h-[400px] animate-pulse border border-[#334155]">
            <div className="h-8 bg-[#334155] rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-[#334155] rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header com estatísticas rápidas */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a] dark:text-[#f1f5f9]">Orçamentos por Funil</h1>
          <p className="text-[#64748b] dark:text-[#94a3b8] mt-1">Gerencie o fluxo de vendas por estágio</p>
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, cliente ou e-mail..."
            className="w-full pl-10 pr-4 py-3 border border-[#cbd5e1] dark:border-[#475569] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors dark:bg-[#334155] dark:text-[#f1f5f9]"
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[700px]">
        {columnOrder.map((statusKey, index) => {
          const status = STATUSES.find(s => s.key === statusKey)!;
          const columnQuotes = filteredQuotes(statusKey);

          return (
            <div
              key={statusKey}
              className={`bg-[#f8fafc] dark:bg-[#0f172a] rounded-2xl p-5 flex flex-col h-full border border-[#e2e8f0] dark:border-[#334155] shadow-sm`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, statusKey)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#e2e8f0] dark:border-[#334155]">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${status.color}`}>
                    {status.label}
                  </span>
                  <span className="text-sm font-semibold text-[#0f172a] dark:text-[#f1f5f9]">{columnQuotes.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      if (index > 0) {
                        const newOrder = [...columnOrder];
                        [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
                        setColumnOrder(newOrder);
                      }
                    }}
                    disabled={index === 0}
                    className="p-1.5 rounded-md hover:bg-[#f1f5f9] dark:hover:bg-[#334155] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Mover coluna para esquerda"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#64748b]" />
                  </button>
                  <button
                    onClick={() => {
                      if (index < columnOrder.length - 1) {
                        const newOrder = [...columnOrder];
                        [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                        setColumnOrder(newOrder);
                      }
                    }}
                    disabled={index === columnOrder.length - 1}
                    className="p-1.5 rounded-md hover:bg-[#f1f5f9] dark:hover:bg-[#334155] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Mover coluna para direita"
                  >
                    <ChevronRight className="w-4 h-4 text-[#64748b]" />
                  </button>
                </div>
              </div>

              {/* Quotes in column */}
              <div className="flex-1 overflow-y-auto space-y-3" role="list" aria-label={`${status.label} orçamentos`}>
                {columnQuotes.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-[#f1f5f9] dark:bg-[#334155] flex items-center justify-center mb-3">
                      <span className="text-[#94a3b8] dark:text-[#64748b]">📭</span>
                    </div>
                    <p className="text-sm text-[#64748b] dark:text-[#94a3b8]">Nenhum orçamento</p>
                  </div>
                ) : (
                  columnQuotes.map(quote => (
                    <QuoteCard
                      key={quote.id}
                      quote={quote}
                      onDragStart={handleDragStart}
                    />
                  ))
                )}
              </div>

              {/* Add button */}
              <Link
                href="/painel/quotes/new"
                className="mt-5 w-full py-3 border-2 border-dashed border-[#cbd5e1] dark:border-[#475569] rounded-xl text-center text-sm font-medium text-[#64748b] dark:text-[#94a3b8] hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Novo
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuoteCard({ quote, onDragStart }: { quote: Quote; onDragStart: (e: React.DragEvent, quote: Quote) => void }) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <article
        draggable
        onDragStart={(e) => onDragStart(e, quote)}
        onClick={() => setShowPreview(true)}
        className="bg-white dark:bg-[#1e293b] rounded-xl border border-[#e2e8f0] dark:border-[#334155] p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        role="listitem"
      >
        <div className="flex items-start justify-between mb-3">
          <span className="font-mono text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">{quote.code}</span>
          <span className={`text-xs font-bold px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300`}>
            {quote.total ? "R$ " + Number(quote.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "—"}
          </span>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium text-[#0f172a] dark:text-[#f1f5f9] truncate">{quote.clientName}</p>
          <p className="text-xs text-[#64748b] dark:text-[#94a3b8] truncate">{quote.clientEmail}</p>
          <div className="mt-2 space-y-1">
            {quote.budget_range && (
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8]">
                <span className="font-bold text-[#0f172a] dark:text-[#f1f5f9]">Orçamento:</span> {getBudgetLabel(quote.budget_range)}
              </p>
            )}
            {quote.deadline_pref && (
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8]">
                <span className="font-bold text-[#0f172a] dark:text-[#f1f5f9]">Prazo:</span> {getDeadlineLabel(quote.deadline_pref)}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <Link
            href={`/painel/quotes/${quote.id}`}
            className="p-1.5 rounded-md text-[#64748b] dark:text-[#94a3b8] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-[#f1f5f9] dark:hover:bg-[#334155] transition-colors"
            title="Ver detalhes"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <Link
            href={`/painel/quotes/${quote.id}`}
            className="p-1.5 rounded-md text-[#64748b] dark:text-[#94a3b8] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-[#f1f5f9] dark:hover:bg-[#334155] transition-colors"
            title="Editar"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <Edit className="w-4 h-4" />
          </Link>
          {quote.clientPhone && (
            <a
              href={`https://wa.me/${quote.clientPhone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              title="WhatsApp"
              onClick={(e) => { e.stopPropagation(); }}
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
        </div>
      </article>

      {/* Preview Drawer */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white dark:bg-[#1e293b] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--bd)" }}>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">{quote.code}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300`}>
                  {quote.total ? "R$ " + Number(quote.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "—"}
                </span>
              </div>
              <button onClick={() => setShowPreview(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X className="w-5 h-5" style={{ color: "var(--mu)" }} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-[#0f172a] dark:text-[#f1f5f9]">{quote.clientName}</p>
                  <p className="text-xs text-[#64748b] dark:text-[#94a3b8]">{quote.clientEmail}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {quote.budget_range && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                    <p className="text-xs font-medium text-[#64748b] dark:text-[#94a3b8]">Orçamento</p>
                    <p className="font-medium text-[#0f172a] dark:text-[#f1f5f9]">{getBudgetLabel(quote.budget_range)}</p>
                  </div>
                )}
                {quote.deadline_pref && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                    <p className="text-xs font-medium text-[#64748b] dark:text-[#94a3b8]">Prazo Preferido</p>
                    <p className="font-medium text-[#0f172a] dark:text-[#f1f5f9]">{getDeadlineLabel(quote.deadline_pref)}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: "var(--bd)" }}>
                <Link
                  href={`/painel/quotes/${quote.id}`}
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver Detalhes Completos
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
