"use client";

import {
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
}

function MetricCard({ title, value, change, icon }: MetricCardProps) {
  const isPositive = change !== undefined ? change >= 0 : true;

  return (
    <div className="painel-c painel-k">
      <div className="painel-ch">
        <div className="painel-kic">{icon}</div>
        <span>{title}</span>
      </div>
      <div className="painel-val">
        <b>{value}</b>
        {change !== undefined && (
          <span className={`painel-pill ${isPositive ? "up" : "dn"}`}>
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3 inline" />
            ) : (
              <ArrowDownRight className="w-3 h-3 inline" />
            )}
            {Math.abs(change)}%
          </span>
        )}
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
        change={12}
        icon={<Users className="w-4 h-4" />}
      />
      <MetricCard
        title="Orçamentos Pendentes"
        value={metrics.pendingQuotes}
        change={-5}
        icon={<Clock className="w-4 h-4" />}
      />
      <MetricCard
        title="Propostas Enviadas"
        value={metrics.sentProposals}
        change={8}
        icon={<FileText className="w-4 h-4" />}
      />
      <MetricCard
        title="Taxa de Conversão"
        value={`${metrics.conversionRate}%`}
        change={4}
        icon={<TrendingUp className="w-4 h-4" />}
      />
      <MetricCard
        title="Total de Clientes"
        value={metrics.totalClients}
        change={15}
        icon={<CheckCircle className="w-4 h-4" />}
      />
      <MetricCard
        title="Receita Aprovada"
        value={`R$ ${metrics.totalRevenue.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })}`}
        change={18}
        icon={<DollarSign className="w-4 h-4" />}
      />
    </div>
  );
}
