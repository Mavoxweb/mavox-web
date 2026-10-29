"use client";

import {
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  CheckCircle,
  Clock,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <div className="painel-c painel-k">
      <div className="painel-ch">
        <div className="painel-kic">{icon}</div>
        <span>{title}</span>
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
      />
      <MetricCard
        title="Orçamentos Pendentes"
        value={metrics.pendingQuotes}
        icon={<Clock className="w-4 h-4" />}
      />
      <MetricCard
        title="Propostas Enviadas"
        value={metrics.sentProposals}
        icon={<FileText className="w-4 h-4" />}
      />
      <MetricCard
        title="Taxa de Conversão"
        value={`${metrics.conversionRate}%`}
        icon={<TrendingUp className="w-4 h-4" />}
      />
      <MetricCard
        title="Total de Clientes"
        value={metrics.totalClients}
        icon={<CheckCircle className="w-4 h-4" />}
      />
      <MetricCard
        title="Receita Aprovada"
        value={`R$ ${metrics.totalRevenue.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })}`}
        icon={<DollarSign className="w-4 h-4" />}
      />
    </div>
  );
}
