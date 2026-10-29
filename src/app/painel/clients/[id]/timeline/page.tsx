"use client";

import { useState, useEffect, useCallback } from "react";
import { use } from "react";
import { Clock, Calendar, User, MessageSquare, CheckCircle2 } from "lucide-react";

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string | null;
  created_at: string;
  created_by: string | null;
}

export default function ClientTimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/painel/clients/${id}/timeline`, { credentials: "include" });
      const data = await res.json();
      setEvents(data.data || []);
    } catch {
      setEvents([]);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a] dark:text-[#f1f5f9]">Linha do Tempo — Lead</h1>
        <p className="text-sm text-[#64748b] dark:text-[#94a3b8]">Eventos cronológicos de contato, proposta e fechamento.</p>
      </div>

      <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-[#e2e8f0] dark:border-[#334155] p-6 space-y-4">
        {events.length === 0 ? (
          <p className="text-sm text-[#94a3b8]">Nenhum evento registrado ainda.</p>
        ) : (
          events.map((ev) => (
            <div key={ev.id} className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-[#64748b] dark:text-[#94a3b8]">
                  <time>{new Date(ev.created_at).toLocaleString("pt-BR")}</time>
                  <span>·</span>
                  <span className="font-medium text-[#334155] dark:text-[#cbd5e1]">{ev.type}</span>
                </div>
                <h3 className="text-sm font-bold text-[#0f172a] dark:text-[#f1f5f9] mt-0.5">{ev.title}</h3>
                {ev.description && <p className="text-xs text-[#475569] dark:text-[#94a3b8] mt-1">{ev.description}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
