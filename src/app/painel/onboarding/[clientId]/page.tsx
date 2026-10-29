"use client";

import { useState } from "react";
import { use } from "react";
import { CheckCircle2, FileText, Lock, Users, ClipboardCheck, CreditCard, BarChart3, History, Upload } from "lucide-react";

const tabs = [
  { key: "briefing", label: "Briefing", icon: FileText },
  { key: "contract", label: "Contrato", icon: Lock },
  { key: "accesses", label: "Acessos", icon: Lock },
  { key: "squad", label: "Squad", icon: Users },
  { key: "checklist", label: "Checklist", icon: ClipboardCheck },
  { key: "financial", label: "Financeiro", icon: CreditCard },
  { key: "reports", label: "Relatórios", icon: BarChart3 },
  { key: "history", label: "Histórico", icon: History },
];

export default function OnboardingPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params);
  const [tab, setTab] = useState("briefing");
  const [status, setStatus] = useState("briefing");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a] dark:text-[#f1f5f9]">Onboarding — Cliente</h1>
          <p className="text-xs text-[#64748b] dark:text-[#94a3b8]">Cliente ID: {clientId}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
          status === "briefing" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
          status === "active" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-amber-100 text-amber-800"
        }`}>
          <CheckCircle2 className="w-3.5 h-3.5" /> {status}
        </span>
      </div>

      <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-[#e2e8f0] dark:border-[#334155] overflow-hidden">
        <div className="flex gap-1 px-4 pt-4 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                tab === t.key ? "bg-blue-600 text-white" : "text-[#475569] dark:text-[#94a3b8] hover:bg-[#f8fafc] dark:hover:bg-[#334155]"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "briefing" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Briefing</h2>
              <textarea placeholder="Informações do briefing..." rows={5} className="w-full rounded-xl border border-[#cbd5e1] dark:border-[#475569] px-4 py-3 text-sm" />
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">Salvar Draft</button>
            </div>
          )}
          {tab === "contract" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Contrato</h2>
              <div className="border-2 border-dashed border-[#cbd5e1] dark:border-[#475569] rounded-xl p-6 text-center">
                <Upload className="w-6 h-6 mx-auto text-[#94a3b8] mb-2" />
                <p className="text-xs text-[#64748b] dark:text-[#94a3b8]">Arraste o PDF assinado ou selecione um arquivo.</p>
                <input type="file" accept=".pdf" className="hidden" />
              </div>
            </div>
          )}
          {tab === "accesses" && (
            <div>
              <h2 className="text-lg font-bold mb-3">Acessos</h2>
              <table className="w-full text-sm border-collapse">
                <thead className="bg-[#f8fafc] dark:bg-[#0f172a]">
                  <tr><th className="text-left px-3 py-2">Plataforma</th><th>URL</th><th>Login</th><th>Responsável</th></tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0] dark:divide-[#334155]">
                  <tr><td className="px-3 py-2">Site</td><td className="text-xs text-[#475569]">https://mavox.com.br</td><td>—</td><td className="text-xs text-[#94a3b8]">Squad Lead</td></tr>
                </tbody>
              </table>
            </div>
          )}
          {tab === "squad" && (
            <div>
              <h2 className="text-lg font-bold mb-3">Squad</h2>
              <p className="text-xs text-[#64748b]">Squad lead: ainda não definido.</p>
            </div>
          )}
          {tab === "checklist" && (
            <div>
              <h2 className="text-lg font-bold mb-3">Checklist</h2>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Briefing concluído</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Contrato assinado</li>
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border border-[#94a3b8]" /> Setup iniciado</li>
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border border-[#94a3b8]" /> Quickstart</li>
              </ul>
            </div>
          )}
          {tab === "financial" && (
            <div>
              <h2 className="text-lg font-bold mb-3">Financeiro</h2>
              <p className="text-xs text-[#64748b]">MRR: ainda não configurado.</p>
            </div>
          )}
          {tab === "reports" && (
            <div>
              <h2 className="text-lg font-bold mb-3">Relatórios</h2>
              <button className="inline-flex items-center gap-2 px-4 py-2 border border-[#cbd5e1] rounded-lg text-sm hover:bg-[#f8fafc]">
                <Upload className="w-4 h-4" /> Upload PDF Mensal
              </button>
            </div>
          )}
          {tab === "history" && (
            <div>
              <h2 className="text-lg font-bold mb-3">Histórico</h2>
              <p className="text-xs text-[#64748b]">Timeline unificada será carregada do banco.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
