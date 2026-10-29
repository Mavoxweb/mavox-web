import {
  getDashboardMetrics,
  getRecentLeads,
  getRecentQuotes,
} from "@/lib/dashboard-repository";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  // Busca tudo em paralelo: 1 query de métricas + 2 listas.
  const [metrics, recentLeads, recentQuotes] = await Promise.all([
    getDashboardMetrics(),
    getRecentLeads(5),
    getRecentQuotes(5),
  ]);

  return (
    <DashboardClient
      metrics={metrics}
      recentLeads={recentLeads}
      recentQuotes={recentQuotes}
    />
  );
}
