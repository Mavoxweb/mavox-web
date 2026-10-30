"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardMetrics } from "@/app/painel/dashboard/components/MetricsCards";
import OpportunitiesPanel from "@/app/painel/dashboard/components/OpportunitiesPanel";
import {
  RecentLeadsList,
  RecentQuotesList,
} from "@/app/painel/dashboard/components/RecentLists";
import type { RecentLead, RecentQuote } from "@/lib/dashboard-repository";
import Link from "next/link";
import {
  UserPlus,
  FileSpreadsheet,
  FilePlus,
  CalendarPlus,
  ArrowRight,
  Sparkles,
  RefreshCw,
  X,
  Loader2,
} from "lucide-react";

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  intent: string;
  tagIds: string[];
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface DashboardClientProps {
  metrics: {
    leadsToday: number;
    pendingQuotes: number;
    sentProposals: number;
    conversionRate: number;
    totalClients: number;
    totalRevenue: number;
  };
  recentLeads: RecentLead[];
  recentQuotes: RecentQuote[];
}

export default function DashboardClient({
  metrics,
  recentLeads,
  recentQuotes,
}: DashboardClientProps) {
  const router = useRouter();
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [formData, setFormData] = useState<ClientFormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "manual",
    intent: "conhecer",
    tagIds: [],
  });

  // Fetch tags for the modal
  const fetchTags = async () => {
    try {
      const res = await fetch("/api/painel/tags?limit=50", { credentials: 'include' });
      const data = await res.json();
      setTags(data.data || []);
    } catch (err) {
      console.error("Erro ao buscar tags:", err);
    }
  };

  const handleTagChange = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/painel/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar cliente");
        setLoading(false);
        return;
      }

      setShowNewClientModal(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        source: "manual",
        intent: "conhecer",
        tagIds: [],
      });
      // Atualiza os dados do Server Component sem recarregar a página inteira
      router.refresh();
    } catch (err) {
      setError("Erro ao criar cliente");
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    fetchTags();
    setShowNewClientModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--tx)" }}>
            Visão Geral
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--mu)" }}>
            Acompanhe em tempo real o funil de vendas, orçamentos e performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(34, 197, 94, 0.12)",
              color: "var(--ok)",
            }}
          >
            <RefreshCw className="w-3 h-3" />
            Dados atualizados
          </span>
          <button onClick={handleOpenModal} className="painel-btn pr">
            <UserPlus className="w-4 h-4" />
            Novo Cliente
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <DashboardMetrics metrics={metrics} />

      {/* Agente diário de oportunidades */}
      <OpportunitiesPanel />

      {/* Main Grid Sections */}
      <div className="painel-g">
        {/* Quick Actions */}
        <div className="painel-c painel-span-4">
          <div className="painel-ch">
            <span className="font-semibold text-sm">Ações Rápidas</span>
          </div>
          <div className="space-y-2.5">
            <button
              onClick={handleOpenModal}
              className="flex items-center justify-between p-3 rounded-xl border transition-all hover:translate-x-0.5 w-full text-left"
              style={{ borderColor: "var(--bd)", background: "var(--side)" }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--tx)" }}>
                    Novo Cliente
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--mu)" }}>
                    Cadastrar cliente manualmente
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5" style={{ color: "var(--mu)" }} />
            </button>

            <Link
              href="/painel/quotes"
              className="flex items-center justify-between p-3 rounded-xl border transition-all hover:translate-x-0.5"
              style={{ borderColor: "var(--bd)", background: "var(--side)" }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--tx)" }}>
                    Ver Orçamentos
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--mu)" }}>
                    Gerenciar funil de vendas
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5" style={{ color: "var(--mu)" }} />
            </Link>

                         <Link
              href="/painel/blog/new"
              className="flex items-center justify-between p-3 rounded-xl border transition-all hover:translate-x-0.5"
              style={{ borderColor: "var(--bd)", background: "var(--side)" }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <FilePlus className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--tx)" }}>
                    Novo Artigo Blog
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--mu)" }}>
                    Gerar artigo com IA
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5" style={{ color: "var(--mu)" }} />
            </Link>

            <Link
              href="/painel/onboarding"
              className="flex items-center justify-between p-3 rounded-xl border transition-all hover:translate-x-0.5"
              style={{ borderColor: "var(--bd)", background: "var(--side)" }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600">
                  <CalendarPlus className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--tx)" }}>
                    Onboarding Clientes
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--mu)" }}>
                    Gerenciar contrato e checklist
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5" style={{ color: "var(--mu)" }} />
            </Link>

            <Link
              href="/painel/onboarding/financeiro"
              className="flex items-center justify-between p-3 rounded-xl border transition-all hover:translate-x-0.5"
              style={{ borderColor: "var(--bd)", background: "var(--side)" }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--tx)" }}>
                    Financeiro
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--mu)" }}>
                    MRR / Pagamentos / Atrasos
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5" style={{ color: "var(--mu)" }} />
            </Link>

            <Link
              href="/painel/appointments"
              className="flex items-center justify-between p-3 rounded-xl border transition-all hover:translate-x-0.5"
              style={{ borderColor: "var(--bd)", background: "var(--side)" }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                  <CalendarPlus className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--tx)" }}>
                    Agendar Reunião
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--mu)" }}>
                    Marcar call com cliente
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5" style={{ color: "var(--mu)" }} />
            </Link>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="painel-c painel-span-4">
          <RecentLeadsList leads={recentLeads} />
        </div>

        {/* Recent Quotes */}
        <div className="painel-c painel-span-4">
          <RecentQuotesList quotes={recentQuotes} />
        </div>
      </div>

      {/* Modal Novo Cliente */}
      {showNewClientModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: "var(--tx)" }}>
                Novo Cliente
              </h3>
              <button
                onClick={() => setShowNewClientModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" style={{ color: "var(--mu)" }} />
              </button>
            </div>

            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-900/50">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium" style={{ color: "var(--tx)" }}>Nome *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome completo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    style={{ borderColor: "var(--bd)", background: "var(--side)" }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium" style={{ color: "var(--tx)" }}>E-mail</label>
                  <input
                    type="email"
                    placeholder="cliente@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    style={{ borderColor: "var(--bd)", background: "var(--side)" }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium" style={{ color: "var(--tx)" }}>WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="(21) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    style={{ borderColor: "var(--bd)", background: "var(--side)" }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium" style={{ color: "var(--tx)" }}>Empresa</label>
                  <input
                    type="text"
                    placeholder="Nome da empresa"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    style={{ borderColor: "var(--bd)", background: "var(--side)" }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium" style={{ color: "var(--tx)" }}>Origem</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    style={{ borderColor: "var(--bd)", background: "var(--side)" }}
                  >
                    <option value="manual">Manual</option>
                    <option value="site">Site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium" style={{ color: "var(--tx)" }}>Intenção</label>
                  <select
                    value={formData.intent}
                    onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    style={{ borderColor: "var(--bd)", background: "var(--side)" }}
                  >
                    <option value="conhecer">Conhecer</option>
                    <option value="avaliando">Avaliando</option>
                    <option value="pronto_para_contratar">Pronto para Contratar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium" style={{ color: "var(--tx)" }}>Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagChange(tag.id)}
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                          formData.tagIds.includes(tag.id)
                            ? "text-white border-transparent"
                            : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                        }`}
                        style={{
                          backgroundColor: formData.tagIds.includes(tag.id) ? tag.color : undefined,
                          borderColor: formData.tagIds.includes(tag.id) ? tag.color : undefined,
                        }}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: "var(--mu)" }}>Clique nas tags para adicionar/remover</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: "var(--bd)" }}>
                <button
                  type="button"
                  onClick={() => setShowNewClientModal(false)}
                  className="painel-btn"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="painel-btn pr flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Cliente"
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