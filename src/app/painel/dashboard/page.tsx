import { getDashboardMetrics } from "@/lib/dashboard-repository";
import { DashboardMetrics } from "@/app/painel/dashboard/components/MetricsCards";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();
  return <DashboardClient metrics={metrics} />;
}