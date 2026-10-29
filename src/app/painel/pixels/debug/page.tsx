"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Clock, TerminalSquare } from "lucide-react";

interface DebugEvent {
  event: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export default function PixelDebugPage() {
  const [events, setEvents] = useState<DebugEvent[]>([]);
  const [status, setStatus] = useState<"ok" | "error">("ok");

  useEffect(() => {
    const w = window as typeof window & { dataLayer?: Record<string, unknown>[] };
    const layer = w.dataLayer || [];
    const parsed: DebugEvent[] = layer
      .filter((e: unknown): e is Record<string, unknown> => typeof e === "object" && e !== null && (e as Record<string, unknown>).event !== undefined)
      .map((e: Record<string, unknown>) => ({
        event: String(e.event),
        timestamp: new Date().toISOString(),
        details: Object.fromEntries(Object.entries(e).filter(([k]) => k !== "event")),
      }));
    setEvents(parsed);
  }, []);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a] dark:text-[#f1f5f9]">Debug de Pixels</h1>
        <p className="text-sm text-[#64748b] dark:text-[#94a3b8] mt-1">
          Eventos capturados do dataLayer (GTM) e scripts de pixel.
        </p>
      </div>

      <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-[#e2e8f0] dark:border-[#334155] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#0f172a] dark:text-[#f1f5f9]">Eventos Recentes</h2>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
              status === "ok" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
            }`}
          >
            {status === "ok" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {status === "ok" ? "Conectado" : "Erro"}
          </span>
        </div>

        <div className="rounded-xl border border-[#e2e8f0] dark:border-[#334155] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#f8fafc] dark:bg-[#0f172a] border-b border-[#e2e8f0] dark:border-[#334155]">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#475569] dark:text-[#94a3b8]">Evento</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#475569] dark:text-[#94a3b8]">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] dark:divide-[#334155]">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-4 text-[#94a3b8] text-xs">
                    Nenhum evento capturado ainda. Interaja com a página para gerar eventos.
                  </td>
                </tr>
              ) : (
                events.map((ev, i) => (
                  <tr key={i} className="hover:bg-[#f8fafc] dark:hover:bg-[#334155]/30">
                    <td className="px-4 py-3 font-mono text-xs text-blue-700 dark:text-blue-400">{ev.event}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#64748b] dark:text-[#94a3b8]">
                      {JSON.stringify(ev.details || {}, null, 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botão "Testar" visual */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            const w = window as typeof window & { dataLayer?: Record<string, unknown>[] };
            w.dataLayer = w.dataLayer || [];
            w.dataLayer.push({ event: "whatsapp_click", url: "https://wa.me/5521992855872", text: "Botão de Teste" });
            setEvents((prev) => [
              ...prev,
              { event: "whatsapp_click", timestamp: new Date().toISOString(), details: { url: "https://wa.me/5521992855872" } },
            ]);
            setStatus("ok");
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
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
            setEvents((prev) => [
              ...prev,
              { event: "form_submit", timestamp: new Date().toISOString(), details: { form_action: "/teste" } },
            ]);
            setStatus("ok");
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#cbd5e1] dark:border-[#475569] rounded-xl text-sm font-semibold text-[#334155] dark:text-[#cbd5e1] hover:bg-[#f8fafc] dark:hover:bg-[#334155] transition-colors"
        >
          <Clock className="w-4 h-4" />
          Testar Form Submit
        </button>
      </div>
    </div>
  );
}
