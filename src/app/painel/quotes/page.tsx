import { QuotesKanban } from "./components/QuotesKanban";

export default async function QuotesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-gray-600 mt-1">Gerencie o funil de vendas</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <Tabs />
        <Suspense fallback={<div className="p-8 text-center animate-pulse text-gray-400">Carregando...</div>}>
          <QuotesKanban />
        </Suspense>
      </div>
    </div>
  );
}

function Tabs() {
  return (
    <div className="border-b border-gray-200 px-6">
      <nav className="flex gap-8" aria-label="Visualização">
        <button className="py-4 px-1 border-b-2 border-blue-600 text-blue-600 font-medium text-sm">
          Kanban
        </button>
        <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 font-medium text-sm hover:text-gray-700 hover:border-gray-300">
          Lista
        </button>
      </nav>
    </div>
  );
}

import { Suspense } from "react";