"use client";

import { useState, useEffect } from "react";
import { Plus, Search, ChevronLeft, ChevronRight, ExternalLink, Edit } from "lucide-react";
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
  { key: "novo", label: "Novo", color: "bg-blue-100 text-blue-800" },
  { key: "em_analise", label: "Em Análise", color: "bg-yellow-100 text-yellow-800" },
  { key: "proposta_enviada", label: "Proposta Enviada", color: "bg-purple-100 text-purple-800" },
  { key: "aprovado", label: "Aprovado", color: "bg-green-100 text-green-800" },
  { key: "recusado", label: "Recusado", color: "bg-red-100 text-red-800" },
  { key: "expirado", label: "Expirado", color: "bg-gray-100 text-gray-800" },
];

export function QuotesKanban() {
  const [quotes, setQuotes] = useState<Record<string, Quote[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [columnOrder, setColumnOrder] = useState(STATUSES.map(s => s.key));

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/painel/quotes?limit=200");
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 p-6">
        {STATUSES.map(status => (
          <div key={status.key} className="bg-gray-50 rounded-xl p-4 min-h-[400px] animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 rounded" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Search */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, nome ou e-mail..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 min-h-[600px]">
        {columnOrder.map((statusKey, index) => {
          const status = STATUSES.find(s => s.key === statusKey)!;
          const columnQuotes = filteredQuotes(statusKey);
          
          return (
            <div
              key={statusKey}
              className="bg-gray-50 rounded-xl p-4 min-h-[500px] flex flex-col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, statusKey)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                    {status.label}
                  </span>
                  <span className="text-sm font-medium text-gray-600">{columnQuotes.length}</span>
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
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Mover coluna para esquerda"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
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
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Mover coluna para direita"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Quotes in column */}
              <div className="flex-1 overflow-y-auto space-y-3" role="list" aria-label={`${status.label} orçamentos`}>
                {columnQuotes.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Nenhum orçamento</div>
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
                className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuoteCard({ quote, onDragStart }: { quote: Quote; onDragStart: (e: React.DragEvent, quote: Quote) => void }) {
  return (
    <article
      draggable
      onDragStart={(e) => onDragStart(e, quote)}
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
      role="listitem"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="font-mono text-sm font-semibold text-gray-900">{quote.code}</span>
      </div>
      <div className="space-y-1 text-sm">
        <p className="font-medium text-gray-900 truncate">{quote.clientName}</p>
        <p className="text-gray-500 truncate">{quote.clientEmail}</p>
        {quote.budget_range && (
          <p className="text-gray-500">Orçamento: {getBudgetLabel(quote.budget_range)}</p>
        )}
        {quote.deadline_pref && (
          <p className="text-gray-500">Prazo: {getDeadlineLabel(quote.deadline_pref)}</p>
        )}
        {quote.total && (
          <p className="font-semibold text-gray-900">Total: R$ {Number(quote.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        )}
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <Link
          href={`/painel/quotes/${quote.id}`}
          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
          title="Ver detalhes"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
        <Link
          href={`/painel/quotes/${quote.id}`}
          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
          title="Editar"
        >
          <Edit className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}