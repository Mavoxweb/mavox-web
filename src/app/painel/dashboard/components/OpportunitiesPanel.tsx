"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  CalendarClock,
  Users,
  FileSpreadsheet,
  Check,
  X,
  Loader2,
} from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "alta" | "media" | "baixa";
  action_url: string | null;
  action_label: string | null;
  source: string;
  created_at: string;
}

const PRIORITY_STYLES: Record<string, { label: string; className: string }> = {
  alta: { label: "Alta", className: "bg-red-100 text-red-700 border-red-200" },
  media: { label: "Média", className: "bg-amber-100 text-amber-700 border-amber-200" },
  baixa: { label: "Baixa", className: "bg-slate-100 text-slate-600 border-slate-200" },
};

function CategoryIcon({ category }: { category: string }) {
  const className = "w-4 h-4";
  switch (category) {
    case "orcamento":
      return <FileSpreadsheet className={className} />;
    case "followup":
      return <TrendingUp className={className} />;
    case "reuniao":
      return <CalendarClock className={className} />;
    case "cliente":
      return <Users className={className} />;
    default:
      return <AlertTriangle className={className} />;
  }
}

export default function OpportunitiesPanel() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [warning, setWarning] = useState("");
  const [feedback, setFeedback] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setWarning("");
    try {
      const res = await fetch("/api/painel/opportunities", { credentials: "include" });
      const data = await res.json();
      setItems(data.data || []);
      setLastRun(data.lastRun ?? null);
      if (data.warning) setWarning(data.warning);
    } catch {
      setWarning("Erro ao carregar oportunidades.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleRun = async () => {
    setRunning(true);
    setFeedback("");
    try {
      const res = await fetch("/api/painel/opportunities", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback(data.error || "Erro ao executar o agente.");
        return;
      }
      setFeedback(
        `${data.inserted} oportunidade(s) gerada(s)${data.usedAi ? " com IA" : " por regras"}.`
      );
      await fetchItems();
    } catch {
      setFeedback("Erro ao executar o agente.");
    } finally {
      setRunning(false);
    }
  };

  const updateStatus = async (id: string, status: "concluida" | "descartada") => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`/api/painel/opportunities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
    } catch {
      // em caso de erro, recarrega para restaurar o item
      fetchItems();
    }
  };

  return (
    <div className="painel-c">
      <div className="painel-ch">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="font-semibold text-sm">Oportunidades do dia</span>
          {items.length > 0 && (
            <span className="painel-pill up">{items.length}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px]" style={{ color: "var(--mu)" }}>
            {lastRun
              ? `Agente: ${new Date(lastRun).toLocaleString("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}`
              : "Agente ainda não executou"}
          </span>
          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-50"
            style={{ borderColor: "var(--bd)", color: "var(--tx)" }}
          >
            {running ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Gerar agora
          </button>
        </div>
      </div>

      {warning && (
        <p className="text-xs text-amber-600 mb-3">{warning}</p>
      )}
      {feedback && (
        <p className="text-xs mb-3" style={{ color: "var(--mu)" }}>
          {feedback}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-xs" style={{ color: "var(--mu)" }}>
          <Loader2 className="w-4 h-4 animate-spin" /> Analisando oportunidades...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <Check className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium" style={{ color: "var(--tx)" }}>
            Nenhuma oportunidade pendente hoje
          </p>
          <p className="text-[11px] mt-1" style={{ color: "var(--mu)" }}>
            O agente roda automaticamente às 00:00 ou quando você clicar em “Gerar agora”.
          </p>
        </div>
      ) : (
        <ul className="grid gap-2.5 md:grid-cols-2">
          {items.map((item) => {
            const priority = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.media;
            return (
              <li
                key={item.id}
                className="rounded-xl border p-3.5 flex flex-col gap-2"
                style={{ borderColor: "var(--bd)", background: "var(--side)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-blue-600 flex-shrink-0">
                      <CategoryIcon category={item.category} />
                    </span>
                    <p
                      className="text-xs font-semibold leading-snug"
                      style={{ color: "var(--tx)" }}
                    >
                      {item.title}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${priority.className}`}
                  >
                    {priority.label}
                  </span>
                </div>

                <p className="text-[11px] leading-relaxed" style={{ color: "var(--mu)" }}>
                  {item.description}
                </p>

                <div className="flex items-center justify-between gap-2 pt-1">
                  {item.action_url ? (
                    <Link
                      href={item.action_url}
                      className="text-[11px] font-medium hover:underline"
                      style={{ color: "var(--p)" }}
                    >
                      {item.action_label || "Abrir"}
                    </Link>
                  ) : (
                    <span />
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateStatus(item.id, "concluida")}
                      className="p-1 rounded-md text-emerald-600 hover:bg-emerald-500/10"
                      title="Marcar como concluída"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(item.id, "descartada")}
                      className="p-1 rounded-md hover:bg-black/5"
                      style={{ color: "var(--mu)" }}
                      title="Descartar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
