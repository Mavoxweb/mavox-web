"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

interface EmailLog {
  id: string;
  to_email: string;
  subject: string;
  template_key: string | null;
  status: "sent" | "error";
  error: string | null;
  created_at: string;
}

export default function LogsSection() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"" | "sent" | "error">("");
  const [warning, setWarning] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setWarning("");
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (filter) params.set("status", filter);
      const res = await fetch(`/api/painel/email-logs?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();
      setLogs(data.data || []);
      if (data.warning) setWarning(data.warning);
    } catch {
      setWarning("Erro ao carregar logs.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Logs de envio</h2>
          <p className="text-gray-500 text-sm">
            Últimos 100 e-mails enviados pelo painel, com status e erro
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "" | "sent" | "error")}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none"
          >
            <option value="">Todos</option>
            <option value="sent">Enviados</option>
            <option value="error">Erros</option>
          </select>
          <button
            type="button"
            onClick={fetchLogs}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>
      </div>

      {warning && (
        <div className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-lg">
          {warning}
        </div>
      )}

      {loading ? (
        <div className="py-10 flex items-center justify-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" /> Carregando logs...
        </div>
      ) : logs.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500">
          Nenhum e-mail enviado ainda. Use o teste de SMTP para validar a configuração.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 text-gray-500">
                <th className="py-2 pr-4 font-medium">Data</th>
                <th className="py-2 pr-4 font-medium">Destinatário</th>
                <th className="py-2 pr-4 font-medium">Assunto</th>
                <th className="py-2 pr-4 font-medium">Template</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 pr-4 text-gray-600 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString("pt-BR")}
                  </td>
                  <td className="py-2 pr-4 text-gray-800">{log.to_email}</td>
                  <td className="py-2 pr-4 text-gray-700 max-w-[280px] truncate">
                    {log.subject}
                  </td>
                  <td className="py-2 pr-4 text-gray-500">{log.template_key || "—"}</td>
                  <td className="py-2">
                    {log.status === "sent" ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" /> Enviado
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 text-red-600"
                        title={log.error || undefined}
                      >
                        <AlertCircle className="w-4 h-4" /> Erro
                      </span>
                    )}
                    {log.status === "error" && log.error && (
                      <p className="text-xs text-red-500 max-w-[260px] truncate mt-0.5">
                        {log.error}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
