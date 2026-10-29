import { Suspense } from "react";
import ClientsPageClient from "./ClientsPage";

export default async function ClientsPage() {
  return (
    <Suspense fallback={<div className="bg-white rounded-xl border border-gray-200 p-8 text-center"><div className="animate-pulse text-gray-400">Carregando clientes...</div></div>}>
      <ClientsPageClient />
    </Suspense>
  );
}