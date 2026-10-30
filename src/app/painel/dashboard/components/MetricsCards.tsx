"use client";

import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  CheckCircle,
  Clock,
  ExternalLink,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  href?: string;
}

function MetricCard({ title, value, icon, href }: MetricCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const isClickable = !!href;

  return (
    <div
      className={`painel-c painel-k ${isClickable ? "painel-k-clickable" : ""}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? `Ver ${title}` : undefined}
    >
      <div className="painel-ch">
        <div className="painel-kic">{icon}</div>
        <span>{title}</span>
        {isClickable && (
          <ExternalLink className="painel-k-link" aria-hidden="true" />
        )}
      </div>
      <div className="painel-val">
        <b>{value}</b>
      </div>
    </div>
  );
}

interface DashboardMetricsProps {
  metrics: {
    leadsToday: number;
    pendingQuotes: number;
    sentProposals: number;
    conversionRate: number;
    totalClients: number;
    totalRevenue: number;
  };
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  return (
    <div className="painel-g">
      <MetricCard
        title="Leads Hoje"
        value={metrics.leadsToday}
        icon={<Users className="w-4 h-4" />}
        href="/painel/clients?source=site"
      />
      <MetricCard
        title="Orçamentos Pendentes"
        value={metrics.pendingQuotes}
        icon={<Clock className="w-4 h-4" />}
        href="/painel/quotes?status=novo,em_analise"
      />
      <MetricCard
        title="Propostas Enviadas"
        value={metrics.sentProposals}
        icon={<FileText className="w-4 h-4" />}
        href="/painel/quotes?status=proposta_enviada"
      />
      <MetricCard
        title="Taxa de Conversão"
        value={`${metrics.conversionRate}%`}
        icon={<TrendingUp className="w-4 h-4" />}
        href="/painel/quotes?status=aprovado"
      />
      <MetricCard
        title="Total de Clientes"
        value={metrics.totalClients}
        icon={<CheckCircle className="w-4 h-4" />}
        href="/painel/clients"
      />
      <MetricCard
        title="Receita Aprovada"
        value={`R$ ${metrics.totalRevenue.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })}`}
        icon={<DollarSign className="w-4 h-4" />}
        href="/painel/onboarding/financeiro"
      />
    </div>
  );
}