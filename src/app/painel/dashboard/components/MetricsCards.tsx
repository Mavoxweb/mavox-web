"use client";

import { TrendingUp, Users, FileText, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

function MetricCard({ title, value, change, icon, iconBg, iconColor }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-sm font-medium ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(change)}% vs mês anterior
              </span>
            </div>
          )}
        </div>
        <div className={`${iconBg} p-3 rounded-xl`}>
          <span className={`${iconColor}`}>{icon}</span>
        </div>
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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <MetricCard
        title="Leads Hoje"
        value={metrics.leadsToday}
        icon={<Users className="w-6 h-6" />}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
      />
      <MetricCard
        title="Orçamentos Pendentes"
        value={metrics.pendingQuotes}
        icon={<FileText className="w-6 h-6" />}
        iconBg="bg-yellow-100"
        iconColor="text-yellow-600"
      />
      <MetricCard
        title="Propostas Enviadas"
        value={metrics.sentProposals}
        icon={<FileText className="w-6 h-6" />}
        iconBg="bg-purple-100"
        iconColor="text-purple-600"
      />
      <MetricCard
        title="Taxa de Conversão"
        value={`${metrics.conversionRate}%`}
        icon={<TrendingUp className="w-6 h-6" />}
        iconBg="bg-green-100"
        iconColor="text-green-600"
      />
      <MetricCard
        title="Total de Clientes"
        value={metrics.totalClients}
        icon={<Users className="w-6 h-6" />}
        iconBg="bg-indigo-100"
        iconColor="text-indigo-600"
      />
      <MetricCard
        title="Receita Aprovada"
        value={`R$ ${metrics.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
        icon={<DollarSign className="w-6 h-6" />}
        iconBg="bg-emerald-100"
        iconColor="text-emerald-600"
      />
    </div>
  );
}