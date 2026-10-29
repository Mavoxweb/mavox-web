"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, CheckCircle2, AlertCircle, MessageSquare, Send, Phone } from "lucide-react";

interface FollowUp {
  id: string;
  rule_id: string;
  lead_id: string | null;
  quote_id: string | null;
  status: string;
  channel: string;
  executed_at: string | null;
  response_received: boolean;
  created_at: string;
  name?: string;
}

export default function FollowUpsPage() {
  const [items, setItems] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/painel/followups", { credentials: "include" });
      const data = await res.json();
      setItems(data.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const filtered = items.filter((i) => (tab === "pending" ? i.status === "pending" || i.status === "sent" : i.status === tab));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a] dark:text-[#f1f5f9]">Follow-ups</h1>
          <p className="text-sm text-[#64748b] dark:text-[#94a3b8] mt-1">Acompanhamento automático de propostas e leads.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-[#e2e8f0] dark:border-[#334155] overflow-hidden">
        <div className="flex gap-1 px-4 pt-4">
          {["pending", "replied", "failed"].map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === t ? "bg-blue-600 text-white" : "text-[#475569] dark:text-[#94a3b8] hover:bg-[#f8fafc] dark:hover:bg-[#334155]"}`}>
              {t === "pending" ? "Pendentes" : t === "replied" ? "Respondidos" : "Falharam"}
            </button>
          ))}
        </div>
        <table className="w-full text-sm">
          <thead className="bg-[#f8fafc] dark:bg-[#0f172a] border-y border-[#e2e8f0] dark:border-[#334155]">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#475569]">Regra / Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#475569]">Canal</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#475569]">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0] dark:divide-[#334155]">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-6 text-[#94a3b8] text-sm">Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-6 text-[#94a3b8] text-sm">Nenhum item.</td></tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#f8fafc] dark:hover:bg-[#334155]/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.status === "replied" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : item.status === "failed" ? <AlertCircle className="w-4 h-4 text-red-600" /> : <Clock className="w-4 h-4 text-amber-500" />}
                      <span className="font-medium text-[#0f172a] dark:text-[#f1f5f9] text-xs">{item.status}</span>
                    </div>
                    <p className="text-xs text-[#64748b] dark:text-[#94a3b8]">Regra: {item.rule_id?.slice(0, 8)}</p>
                  </td>
                  <td className="px-4 py-3"><span className="inline-flex items-center gap-1 text-xs text-[#475569] dark:text-[#94a3b8]">{item.channel === "whatsapp" ? <MessageSquare className="w-3 h-3" /> : <Send className="w-3 h-3" />}{item.channel}</span></td>
                  <td className="px-4 py-3 text-xs text-[#64748b] dark:text-[#94a3b8]">{new Date(item.created_at).toLocaleString("pt-BR")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
