"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertCircle, CheckCircle2, TerminalSquare, RefreshCw, Loader2, Clock } from "lucide-react";

interface PixelEventLog {
  id: string;
  event_name: string;
  pixel_type: string;
  pixel_id: string | null;
  event_data: Record<string, unknown>;
  event_id: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

export default function PixelDebugPage() {
  const [events, setEvents] = useState<PixelEventLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/painel/pixels/log?limit=50", { credentials: "include" });
      if (!res.ok) throw new Error("Erro ao buscar logs");
      const data = await res.json();
      setEvents(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000); // Poll a cada 5s para tempo real
    return () => clearInterval(interval);
  }, [fetchEvents]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Debug de Pixels</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Log persistente dos últimos 50 eventos disparados (atualiza a cada 5s)
          </p>
        </div>
        <button
          onClick={fetchEvents}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-colors"
          style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--surface-elevated)" }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Atualizar
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid var(--bad)", color: "var(--bad)" }}>
          <AlertCircle className="w-4 h-4 inline mr-2" /> {error}
        </div>
      )}

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="bg-[var(--surface-elevated)] border-b p-4" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Eventos Recentes (últimos 50)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface-elevated)] border-b" style={{ borderColor: "var(--border)" }}>
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Evento</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Tipo</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Pixel ID</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Event ID</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Status</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Horário</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                    Nenhum evento registrado ainda. Interaja com o site para gerar eventos.
                  </td>
                </tr>
              ) : (
                events.map((ev, i) => (
                  <tr key={ev.id} className="hover:bg-[var(--surface-elevated)]">
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--accent)" }}>
                      {ev.event_name}
                    </td>
                    <td className="px-4 py-3 px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium"
                        style={{
                          background: ev.pixel_type === "meta_capi" ? "rgba(139,92,246,0.15)" :
                                    ev.pixel_type === "gtm" ? "rgba(59,130,246,0.15)" :
                                    ev.pixel_type === "meta_pixel" ? "rgba(249,168,37,0.15)" :
                                    "rgba(16,185,129,0.15)",
                          color: ev.pixel_type === "meta_capi" ? "rgb(167,139,250)" :
                                   ev.pixel_type === "gtm" ? "rgb(96,165,250)" :
                                   ev.pixel_type === "meta_pixel" ? "rgb(250,204,21)" :
                                   "rgb(34,197,94)",
                        }}>
                        {ev.pixel_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs truncate max-w-[120px]" style={{ color: "var(--text-muted)" }}>
                      {ev.pixel_id || "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs truncate max-w-[100px]" style={{ color: "var(--text-muted)" }}>
                      {ev.event_id || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                        ev.status === "sent" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" :
                        ev.status === "failed" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" :
                        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      }`}>
                        {ev.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(ev.created_at).toLocaleTimeString("pt-BR", { hour12: false })}
                    </td>
                    <td className="px-4 py-3">
                      <details className="cursor-pointer">
                        <summary className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Ver JSON</summary>
                        <pre className="mt-1 p-2 rounded text-[10px] overflow-x-auto max-h-32" style={{ background: "var(--surface-elevated)", color: "var(--text-muted)" }}>
                          {JSON.stringify(ev.event_data, null, 2)}
                        </pre>
                      </details>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botões de teste rápidos */}
      <div className="flex flex-wrap gap-3 p-4 rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <h3 className="w-full text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>Testes Rápidos</h3>
        <button
          type="button"
          onClick={() => {
            const w = window as typeof window & { dataLayer?: Record<string, unknown>[] };
            w.dataLayer = w.dataLayer || [];
            w.dataLayer.push({ event: "whatsapp_click", url: "https://wa.me/5521992855872", text: "Botão de Teste" });
            fetchEvents();
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: "var(--accent)", color: "white" }}
        >
          <TerminalSquare className="w-4 h-4" />
          Testar WhatsApp Click
        </button>
        <button
          type="button"
          onClick={() => {
            const w = window as typeof window & { dataLayer?: Record<string, unknown>[] };
            w.dataLayer = w.dataLayer || [];
            w.dataLayer.push({ event: "form_submit", form_action: "/teste", form_id: "teste-form" });
            fetchEvents();
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-semibold transition-colors"
          style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--surface-elevated)" }}
        >
          <Clock className="w-4 h-4" />
          Testar Form Submit
        </button>
        <button
          type="button"
          onClick={() => {
            const w = window as typeof window & { dataLayer?: Record<string, unknown>[] };
            w.dataLayer = w.dataLayer || [];
            w.dataLayer.push({ event: "proposal_view", proposal_id: "test-123", proposal_token: "MVX-2026-TEST" });
            fetchEvents();
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-semibold transition-colors"
          style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--surface-elevated)" }}
        >
          <TerminalSquare className="w-4 h-4" />
          Testar Proposal View
        </button>
        <button
          type="button"
          onClick={() => {
            const w = window as typeof window & { dataLayer?: Record<string, unknown>[] };
            w.dataLayer = w.dataLayer || [];
            w.dataLayer.push({ event: "proposal_accept", proposal_id: "test-123", proposal_token: "MVX-2026-TEST", value: 5000, currency: "BRL" });
            fetchEvents();
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-semibold transition-colors"
          style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--surface-elevated)" }}
        >
          <CheckCircle2 className="w-4 h-4" />
          Testar Proposal Accept
        </button>
      </div>
    </div>
  );
}