"use client";

import { Suspense, useState } from "react";
import { ClientList } from "./components/ClientList";
import Link from "next/link";
import { Upload, Download, X, FileText, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface ImportResult {
  success: number;
  errors: string[];
}

export default function ClientsPage() {
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMode, setImportMode] = useState<"json" | "xlsx">("json");
  const [jsonInput, setJsonInput] = useState("");
  const [xlsxFile, setXlsxFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [templateDownloading, setTemplateDownloading] = useState(false);

  const handleJsonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonInput.trim()) return;
    setImporting(true);
    setResult(null);

    try {
      const res = await fetch("/api/painel/clients/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ data: JSON.parse(jsonInput) }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success > 0) setJsonInput("");
    } catch (err) {
      setResult({ success: 0, errors: ["Erro ao importar: " + err] });
    } finally {
      setImporting(false);
    }
  };

  const handleXlsxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!xlsxFile) return;
    setImporting(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", xlsxFile);

    try {
      const res = await fetch("/api/painel/clients/bulk", {
        method: "POST",
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      setResult(data);
      if (data.success > 0) setXlsxFile(null);
    } catch (err) {
      setResult({ success: 0, errors: ["Erro ao importar: " + err] });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = async () => {
    setTemplateDownloading(true);
    try {
      const res = await fetch("/api/painel/clients/template");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "template-importacao-clientes.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Erro ao baixar template:", err);
    } finally {
      setTemplateDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">Gerencie leads do site e clientes externos</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowImportModal(true); setImportMode("json"); setResult(null); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload className="w-5 h-5" />
            Importar (JSON)
          </button>
          <button
            onClick={() => { setShowImportModal(true); setImportMode("xlsx"); setResult(null); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Upload className="w-5 h-5" />
            Importar (.xlsx)
          </button>
          <Link
            href="/painel/clients/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Cliente
          </Link>
        </div>
      </div>

      <Suspense fallback={<div className="bg-white rounded-xl border border-gray-200 p-8 text-center"><div className="animate-pulse text-gray-400">Carregando clientes...</div></div>}>
        <ClientList />
      </Suspense>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: "var(--tx)" }}>
                {importMode === "json" ? "Importar Clientes (JSON)" : "Importar Clientes (.xlsx)"}
              </h3>
              <button onClick={() => { setShowImportModal(false); setResult(null); }} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X className="w-5 h-5" style={{ color: "var(--mu)" }} />
              </button>
            </div>

            {result && (
              <div className="mb-4 p-4 rounded-lg border" style={{
                backgroundColor: result.success > 0 ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                borderColor: result.success > 0 ? "var(--ok)" : "var(--bad)",
                color: result.success > 0 ? "var(--ok)" : "var(--bad)"
              }}>
                <div className="flex items-center gap-2 mb-2">
                  {result.success > 0 ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span className="font-medium">
                    {result.success > 0 ? `Importados com sucesso: ${result.success}` : "Falha na importação"}
                  </span>
                </div>
                {result.errors.length > 0 && (
                  <div className="text-sm">
                    <p className="font-medium mb-1">Erros:</p>
                    <ul className="list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
                      {result.errors.slice(0, 10).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                      {result.errors.length > 10 && <li>...e mais {result.errors.length - 10} erros</li>}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="mb-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setImportMode("json")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    importMode === "json"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  Colar JSON
                </button>
                <button
                  onClick={() => setImportMode("xlsx")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    importMode === "xlsx"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  Arquivo .xlsx
                </button>
              </div>

              {importMode === "json" && (
                <form onSubmit={handleJsonSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--tx)" }}>
                      Cole o JSON dos clientes (array de objetos)
                    </label>
                    <textarea
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      rows={10}
                      placeholder='[
  { "name": "João Silva", "email": "joao@email.com", "phone": "(11) 99999-9999", "company": "Empresa A", "source": "manual", "intent": "conhecer", "tagIds": [] },
  { "name": "Maria Santos", "email": "maria@email.com", "phone": "(21) 88888-8888", "company": "Empresa B", "source": "site", "intent": "avaliando", "tagIds": ["tag-id-1"] }
]'
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
                      style={{ borderColor: "var(--bd)", background: "var(--side)" }}
                    />
                    <p className="text-xs mt-1" style={{ color: "var(--mu)" }}>
                      Campos: name (obrigatório), email, phone, company, source (manual|site), intent (conhecer|avaliando|pronto_para_contratar), tagIds (array de IDs de tags)
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => { setShowImportModal(false); setResult(null); }} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" disabled={importing || !jsonInput.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                      {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Importar"}
                    </button>
                  </div>
                </form>
              )}

              {importMode === "xlsx" && (
                <form onSubmit={handleXlsxSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--tx)" }}>Arquivo .xlsx</label>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => setXlsxFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      style={{ borderColor: "var(--bd)", background: "var(--side)" }}
                    />
                    <p className="text-xs mt-1" style={{ color: "var(--mu)" }}>
                      Colunas esperadas: name, email, phone, company, source, intent, tagIds (separados por ;)
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => { setShowImportModal(false); setResult(null); }} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" disabled={importing || !xlsxFile} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                      {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Importar"}
                    </button>
                  </div>
                </form>
              )}

              <div className="pt-4 border-t" style={{ borderColor: "var(--bd)" }}>
                <button
                  onClick={downloadTemplate}
                  disabled={templateDownloading}
                  className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  style={{ borderColor: "var(--bd)" }}
                >
                  <Download className="w-4 h-4" />
                  <FileText className="w-4 h-4" />
                  {templateDownloading ? "Baixando..." : "Baixar Template .xlsx"}
                </button>
                <p className="text-xs mt-2" style={{ color: "var(--mu)" }}>
                  O template contém as colunas corretas e exemplos de preenchimento.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}