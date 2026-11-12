"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface OnboardingRow {
  id: string;
  client_id?: string;
  client_name: string;
  quote_id?: string;
  status: string;
  contract_value?: number;
}

export default function OnboardingPage() {
  const [data, setData] = useState<OnboardingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/painel/onboarding", { credentials: "include" });
        const json = await res.json();
        const rows = Array.isArray(json) ? json : json?.data;
        setData(Array.isArray(rows) ? rows : []);
      } catch {
        // Silenciar
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a] dark:text-[#f1f5f9]">Onboarding de Clientes</h1>
        <p className="text-sm text-[#64748b] dark:text-[#94a3b8] mt-1">
          Acompanhe os contratos, checklists e progresso de onboarding de cada cliente.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin w-6 h-6 border-2 border-blue-600 rounded-full border-t-transparent" />
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-2xl border border-[#e2e8f0] dark:border-[#334155] p-8 text-center">
          <p className="text-[#94a3b8]">Nenhum onboarding ativo no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((row) => (
            <Link
              key={row.id}
              href={`/painel/onboarding/${row.client_id ?? row.id}`}
              className="block p-4 rounded-xl border border-[#e2e8f0] dark:border-[#334155] hover:shadow-md transition-shadow bg-white dark:bg-[#1e293b] hover:bg-[#f8fafc] dark:hover:bg-[#334155]/30"
            >
              <div className="font-semibold text-[#0f172a] dark:text-[#f1f5f9] mb-1 truncate">
                {row.client_name}
              </div>
              <div className="text-xs text-[#64748b] dark:text-[#94a3b8] mb-1">
                Status: <span className="font-medium">{row.status}</span>
              </div>
              {row.contract_value && (
                <div className="text-xs text-[#475569] dark:text-[#94a3b8]">
                  Valor do contrato: R$ {Number(row.contract_value).toLocaleString("pt-BR")}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}