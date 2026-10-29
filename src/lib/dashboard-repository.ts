import { query } from "@/lib/db";

export interface DashboardMetrics {
  leadsToday: number;
  pendingQuotes: number;
  sentProposals: number;
  conversionRate: number;
  totalClients: number;
  totalRevenue: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [
    leadsTodayResult,
    pendingQuotesResult,
    sentProposalsResult,
    approvedQuotesResult,
    totalClientsResult,
    totalRevenueResult,
  ] = await Promise.all([
    query<{ count: string }>(
      `SELECT COUNT(*) as count FROM leads WHERE DATE(created_at) = CURRENT_DATE`
    ),
    query<{ count: string }>(
      `SELECT COUNT(*) as count FROM quotes WHERE status IN ('novo', 'em_analise')`
    ),
    query<{ count: string }>(
      `SELECT COUNT(*) as count FROM quotes WHERE status = 'proposta_enviada'`
    ),
    query<{ count: string }>(
      `SELECT COUNT(*) as count FROM quotes WHERE status = 'aprovado'`
    ),
    query<{ count: string }>(
      `SELECT COUNT(*) as count FROM clients`
    ),
    query<{ total: string }>(
      `SELECT COALESCE(SUM(total), 0) as total FROM quotes WHERE status = 'aprovado'`
    ),
  ]);

  const leadsToday = parseInt(leadsTodayResult[0]?.count ?? "0");
  const pendingQuotes = parseInt(pendingQuotesResult[0]?.count ?? "0");
  const sentProposals = parseInt(sentProposalsResult[0]?.count ?? "0");
  const approvedQuotes = parseInt(approvedQuotesResult[0]?.count ?? "0");
  const totalClients = parseInt(totalClientsResult[0]?.count ?? "0");
  const totalRevenue = parseFloat(totalRevenueResult[0]?.total ?? "0");

  const totalQuotes = pendingQuotes + sentProposals + approvedQuotes;
  const conversionRate = totalQuotes > 0 ? (approvedQuotes / totalQuotes) * 100 : 0;

  return {
    leadsToday,
    pendingQuotes,
    sentProposals,
    conversionRate: Math.round(conversionRate * 10) / 10,
    totalClients,
    totalRevenue,
  };
}

export interface RecentLead {
  id: string;
  name: string;
  email: string;
  source: string;
  createdAt: string;
}

export async function getRecentLeads(limit = 5): Promise<RecentLead[]> {
  const rows = await query<RecentLead>(
    `SELECT id, name, email, source, created_at as "createdAt" FROM leads ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return rows;
}

export interface RecentQuote {
  id: string;
  code: string;
  status: string;
  clientName: string;
  createdAt: string;
}

export async function getRecentQuotes(limit = 5): Promise<RecentQuote[]> {
  const rows = await query<RecentQuote>(
    `SELECT q.id, q.code, q.status, c.name as "clientName", q.created_at as "createdAt"
     FROM quotes q
     JOIN leads c ON q.lead_id = c.id
     ORDER BY q.created_at DESC LIMIT $1`,
    [limit]
  );
  return rows;
}