"use client";

import { useState, useEffect, Suspense } from "react";
import { QuotesKanban } from "./components/QuotesKanban";
import { QuotesList } from "./components/QuotesList";
import { Kanban, List, Plus } from "lucide-react";
import Link from "next/link";

export default function QuotesPage() {
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  useEffect(() => {
    const saved = localStorage.getItem("mavox-quotes-view");
    if (saved === "list" || saved === "kanban") {
      setViewMode(saved);
    }
  }, []);

  const handleToggleView = (mode: "kanban" | "list") => {
    setViewMode(mode);
    localStorage.setItem("mavox-quotes-view", mode);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--tx)" }}>
            Funil de Orçamentos
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--mu)" }}>
            Acompanhe pedidos de orçamentos, altere status e gere propostas com PDF.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center p-1 rounded-xl border"
            style={{ borderColor: "var(--bd)", background: "var(--side)" }}
          >
            <button
              onClick={() => handleToggleView("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "kanban"
                  ? "bg-white dark:bg-[#181822] shadow-sm text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => handleToggleView("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "list"
                  ? "bg-white dark:bg-[#181822] shadow-sm text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Lista
            </button>
          </div>

          <Link href="/painel/clients/new" className="painel-btn pr">
            <Plus className="w-4 h-4" />
            Novo Orçamento
          </Link>
        </div>
      </div>

      {/* View Content */}
      <div className="painel-c p-4 sm:p-6">
        <Suspense
          fallback={
            <div className="p-12 text-center text-xs animate-pulse" style={{ color: "var(--mu)" }}>
              Carregando orçamentos...
            </div>
          }
        >
          {viewMode === "kanban" ? <QuotesKanban /> : <QuotesList />}
        </Suspense>
      </div>
    </div>
  );
}
