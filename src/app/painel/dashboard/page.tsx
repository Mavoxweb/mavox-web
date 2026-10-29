import { getDashboardMetrics } from "@/lib/dashboard-repository";
import { DashboardMetrics } from "@/app/painel/dashboard/components/MetricsCards";
import Link from "next/link";
import {
  UserPlus,
  FileSpreadsheet,
  FilePlus,
  CalendarPlus,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

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
            <RefreshCw className="w-3 h-3 animate-spin" />
            Dados sincronizados
          </span>
          <Link href="/painel/clients/new" className="painel-btn pr">
            <UserPlus className="w-4 h-4" />
            Novo Cliente
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <DashboardMetrics metrics={metrics} />

      {/* Main Grid Sections */}
      <div className="painel-g">
        {/* Quick Actions */}
        <div className="painel-c painel-span-4">
          <div className="painel-ch">
            <span className="font-semibold text-sm">Ações Rápidas</span>
          </div>
          <div className="space-y-2.5">
            <Link
              href="/painel/clients/new"
              className="flex items-center justify-between p-3 rounded-xl border transition-all hover:translate-x-0.5"
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
            </Link>

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
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
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
          <RecentLeads />
        </div>

        {/* Recent Quotes */}
        <div className="painel-c painel-span-4">
          <RecentQuotes />
        </div>
      </div>
    </div>
  );
}

async function RecentLeads() {
  const { getRecentLeads } = await import("@/lib/dashboard-repository");
  const leads = await getRecentLeads(5);

  return (
    <div>
      <div className="painel-ch">
        <span className="font-semibold text-sm">Leads Recentes</span>
        <Link
          href="/painel/clients"
          className="more hover:underline"
          style={{ color: "var(--p)" }}
        >
          Ver todos
        </Link>
      </div>

      {leads.length === 0 ? (
        <p className="text-xs text-center py-10" style={{ color: "var(--mu)" }}>
          Nenhum lead cadastrado ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {leads.map((lead) => (
            <li
              key={lead.id}
              className="flex items-center justify-between p-2.5 rounded-lg border"
              style={{ borderColor: "var(--bd)", background: "var(--side)" }}
            >
              <div className="min-w-0 pr-2">
                <p className="text-xs font-semibold truncate" style={{ color: "var(--tx)" }}>
                  {lead.name}
                </p>
                <p className="text-[11px] truncate" style={{ color: "var(--mu)" }}>
                  {lead.email}
                </p>
              </div>
              <span className={`painel-pill ${getSourcePillClass(lead.source)} flex-shrink-0`}>
                {getSourceLabel(lead.source)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function RecentQuotes() {
  const { getRecentQuotes } = await import("@/lib/dashboard-repository");
  const quotes = await getRecentQuotes(5);

  return (
    <div>
      <div className="painel-ch">
        <span className="font-semibold text-sm">Orçamentos Recentes</span>
        <Link
          href="/painel/quotes"
          className="more hover:underline"
          style={{ color: "var(--p)" }}
        >
          Ver todos
        </Link>
      </div>

      {quotes.length === 0 ? (
        <p className="text-xs text-center py-10" style={{ color: "var(--mu)" }}>
          Nenhum orçamento emitido.
        </p>
      ) : (
        <ul className="space-y-2">
          {quotes.map((quote) => (
            <li
              key={quote.id}
              className="flex items-center justify-between p-2.5 rounded-lg border"
              style={{ borderColor: "var(--bd)", background: "var(--side)" }}
            >
              <div className="min-w-0 pr-2">
                <p className="text-xs font-semibold truncate" style={{ color: "var(--tx)" }}>
                  {quote.code}
                </p>
                <p className="text-[11px] truncate" style={{ color: "var(--mu)" }}>
                  {quote.clientName}
                </p>
              </div>
              <span className={`painel-pill ${getStatusPillClass(quote.status)} flex-shrink-0`}>
                {getStatusLabel(quote.status)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function getSourcePillClass(source: string) {
  switch (source) {
    case "site":
      return "up";
    case "manual":
      return "";
    default:
      return "";
  }
}

function getSourceLabel(source: string) {
  switch (source) {
    case "site":
      return "Site";
    case "manual":
      return "Manual";
    default:
      return source;
  }
}

function getStatusPillClass(status: string) {
  switch (status) {
    case "aprovado":
      return "up";
    case "recusado":
      return "dn";
    case "proposta_enviada":
      return "up";
    default:
      return "";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "novo":
      return "Novo";
    case "em_analise":
      return "Em Análise";
    case "proposta_enviada":
      return "Proposta";
    case "aprovado":
      return "Aprovado";
    case "recusado":
      return "Recusado";
    case "expirado":
      return "Expirado";
    default:
      return status;
  }
}
