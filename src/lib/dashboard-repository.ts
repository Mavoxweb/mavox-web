import { query } from "@/lib/db";

export interface DashboardMetrics {
  leadsToday: number;
  pendingQuotes: number;
  sentProposals: number;
  conversionRate: number;
  totalClients: number;
  totalRevenue: number;
}

interface MetricsRow {
  leadsToday: number;
  pendingQuotes: number;
  sentProposals: number;
  approvedQuotes: number;
  totalClients: number;
  totalRevenue: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  // Uma única ida ao banco em vez de seis consultas separadas.
  const rows = await query<MetricsRow>(`
    SELECT
      (SELECT COUNT(*) FROM clients WHERE created_at >= CURRENT_DATE)::int AS "leadsToday",
      (SELECT COUNT(*) FROM quotes WHERE status IN ('novo', 'em_analise'))::int AS "pendingQuotes",
      (SELECT COUNT(*) FROM quotes WHERE status = 'proposta_enviada')::int AS "sentProposals",
      (SELECT COUNT(*) FROM quotes WHERE status = 'aprovado')::int AS "approvedQuotes",
      (SELECT COUNT(*) FROM clients)::int AS "totalClients",
      (SELECT COALESCE(SUM(total), 0) FROM quotes WHERE status = 'aprovado')::float8 AS "totalRevenue"
  `);

  const row = rows[0];

  const leadsToday = row?.leadsToday ?? 0;
  const pendingQuotes = row?.pendingQuotes ?? 0;
  const sentProposals = row?.sentProposals ?? 0;
  const approvedQuotes = row?.approvedQuotes ?? 0;
  const totalClients = row?.totalClients ?? 0;
  const totalRevenue = row?.totalRevenue ?? 0;

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
  email: string | null;
  phone: string | null;
  source: string | null;
  createdAt: string;
}

export async function getRecentLeads(limit = 5): Promise<RecentLead[]> {
  const rows = await query<RecentLead>(
    `SELECT id, name, email, phone, source, created_at as "createdAt"
     FROM clients
     ORDER BY created_at DESC
     LIMIT $1`,
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