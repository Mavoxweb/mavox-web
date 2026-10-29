import { getDashboardMetrics } from "@/lib/dashboard-repository";
import { DashboardMetrics } from "@/app/painel/dashboard/components/MetricsCards";

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral do funil de vendas e métricas principais</p>
        </div>
      </div>

      <DashboardMetrics metrics={metrics} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <QuickActions />
        <RecentLeads />
        <RecentQuotes />
      </div>
    </div>
  );
}

function QuickActions() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
      <div className="space-y-3">
        <a href="/painel/clients/new" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <p className="font-medium text-gray-900">Novo Cliente</p>
          <p className="text-sm text-gray-500 mt-1">Cadastrar cliente externo manualmente</p>
        </a>
        <a href="/painel/quotes" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <p className="font-medium text-gray-900">Ver Orçamentos</p>
          <p className="text-sm text-gray-500 mt-1">Gerenciar funil de vendas</p>
        </a>
        <a href="/painel/blog/new" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <p className="font-medium text-gray-900">Novo Artigo do Blog</p>
          <p className="text-sm text-gray-500 mt-1">Criar conteúdo com IA</p>
        </a>
        <a href="/painel/appointments" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <p className="font-medium text-gray-900">Agendar Reunião</p>
          <p className="text-sm text-gray-500 mt-1">Marcar call com cliente</p>
        </a>
      </div>
    </div>
  );
}

async function RecentLeads() {
  const { getRecentLeads } = await import("@/lib/dashboard-repository");
  const leads = await getRecentLeads(5);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Leads Recentes</h2>
        <a href="/painel/clients" className="text-sm text-blue-600 hover:text-blue-700">Ver todos</a>
      </div>
      {leads.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Nenhum lead cadastrado</p>
      ) : (
        <ul className="space-y-3">
          {leads.map((lead) => (
            <li key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{lead.name}</p>
                <p className="text-sm text-gray-500">{lead.email}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSourceColor(lead.source)}`}>
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
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Orçamentos Recentes</h2>
        <a href="/painel/quotes" className="text-sm text-blue-600 hover:text-blue-700">Ver todos</a>
      </div>
      {quotes.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Nenhum orçamento</p>
      ) : (
        <ul className="space-y-3">
          {quotes.map((quote) => (
            <li key={quote.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{quote.code}</p>
                <p className="text-sm text-gray-500">{quote.clientName}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                {getStatusLabel(quote.status)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function getSourceColor(source: string) {
  switch (source) {
    case "site": return "bg-green-100 text-green-800";
    case "manual": return "bg-blue-100 text-blue-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

function getSourceLabel(source: string) {
  switch (source) {
    case "site": return "Site";
    case "manual": return "Manual";
    default: return source;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "novo": return "bg-blue-100 text-blue-800";
    case "em_analise": return "bg-yellow-100 text-yellow-800";
    case "proposta_enviada": return "bg-purple-100 text-purple-800";
    case "aprovado": return "bg-green-100 text-green-800";
    case "recusado": return "bg-red-100 text-red-800";
    case "expirado": return "bg-gray-100 text-gray-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "novo": return "Novo";
    case "em_analise": return "Em Análise";
    case "proposta_enviada": return "Proposta Enviada";
    case "aprovado": return "Aprovado";
    case "recusado": return "Recusado";
    case "expirado": return "Expirado";
    default: return status;
  }
}