"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Check,
  Loader2,
  Globe,
  Shield,
  Mail,
  Zap,
  FileText,
  ScrollText,
} from "lucide-react";
import { DEFAULT_TASK_MODELS } from "@/lib/ai";
import SmtpSection from "./components/SmtpSection";
import AISection from "./components/AISection";
import TemplatesSection from "./components/TemplatesSection";
import LogsSection from "./components/LogsSection";

interface Settings {
  openrouter_api_key: string;
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  whatsapp_number: string;
  meta_pixel_id: string;
  google_ads_id: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  smtp_secure: boolean;
  smtp_from_name: string;
  smtp_from_email: string;
  ai_models: Record<string, string>;
  daily_agent_model: string;
  daily_agent_enabled: boolean;
  daily_agent_last_run: string | null;
}

type TabKey = "geral" | "smtp" | "ia" | "templates" | "logs";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "geral", label: "Geral", icon: Globe },
  { key: "smtp", label: "SMTP", icon: Mail },
  { key: "ia", label: "IA & Agente", icon: Zap },
  { key: "templates", label: "Templates", icon: FileText },
  { key: "logs", label: "Logs", icon: ScrollText },
];

const INITIAL: Settings = {
  openrouter_api_key: "",
  company_name: "Mavox",
  company_email: "contato@mavox.com.br",
  company_phone: "(21) 99999-9999",
  company_address: "",
  whatsapp_number: "5521992855872",
  meta_pixel_id: "",
  google_ads_id: "",
  smtp_host: "",
  smtp_port: 587,
  smtp_user: "",
  smtp_password: "",
  smtp_secure: false,
  smtp_from_name: "",
  smtp_from_email: "",
  ai_models: DEFAULT_TASK_MODELS,
  daily_agent_model: "",
  daily_agent_enabled: true,
  daily_agent_last_run: null,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(INITIAL);
  const [tab, setTab] = useState<TabKey>("geral");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/painel/settings", { credentials: "include" });
      const data = await res.json();
      setSettings({
        ...INITIAL,
        ...data,
        ai_models: { ...DEFAULT_TASK_MODELS, ...(data.ai_models || {}) },
      });
      if (data._warning) setWarning(data._warning);
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
      setError("Erro ao carregar configurações.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const persist = async (): Promise<boolean> => {
    const res = await fetch("/api/painel/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(settings),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao salvar configurações");
      return false;
    }
    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (await persist()) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      setError("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const handleTestSmtp = async (to: string) => {
    setTestingSmtp(true);
    setSmtpTestResult(null);
    setError("");

    try {
      const savedOk = await persist();
      if (!savedOk) {
        setSmtpTestResult({ ok: false, message: "Não foi possível salvar as configurações." });
        return;
      }

      const res = await fetch("/api/painel/settings/test-smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ to }),
      });
      const data = await res.json();

      if (!data.ok) {
        setSmtpTestResult({
          ok: false,
          message:
            data.stage === "send"
              ? `Conexão OK, mas o envio falhou: ${data.error}`
              : `Falha na conexão: ${data.error}`,
        });
        return;
      }

      setSmtpTestResult({
        ok: true,
        message: to
          ? `Conexão validada e e-mail de teste enviado para ${to}.`
          : "Conexão SMTP validada com sucesso.",
      });
    } catch {
      setSmtpTestResult({ ok: false, message: "Erro ao testar SMTP." });
    } finally {
      setTestingSmtp(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const showSaveButton = tab === "geral" || tab === "smtp" || tab === "ia";

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-1">
            Empresa, SMTP, inteligência artificial, templates e logs
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setTab(key);
              setError("");
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {warning && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg">
          {warning}
        </div>
      )}

      {tab === "geral" && (
        <>
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Informações da Empresa</h2>
                <p className="text-gray-500 text-sm">
                  Dados exibidos no site, e-mails e propostas
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  value={settings.company_name}
                  onChange={(e) => handleChange("company_name", e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                <input
                  type="email"
                  value={settings.company_email}
                  onChange={(e) => handleChange("company_email", e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                <input
                  type="tel"
                  value={settings.company_phone}
                  onChange={(e) => handleChange("company_phone", e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input
                  type="tel"
                  value={settings.whatsapp_number}
                  onChange={(e) => handleChange("whatsapp_number", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="5521992855872"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <textarea
                  value={settings.company_address}
                  onChange={(e) => handleChange("company_address", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Pixels de Rastreamento</h2>
                <p className="text-gray-500 text-sm">
                  IDs para Meta Ads (Facebook/Instagram) e Google Ads
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Pixel ID</label>
                <input
                  type="text"
                  value={settings.meta_pixel_id}
                  onChange={(e) => handleChange("meta_pixel_id", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Ex: 123456789012345"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Encontrado no Gerenciador de Eventos do Facebook
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Ads ID</label>
                <input
                  type="text"
                  value={settings.google_ads_id}
                  onChange={(e) => handleChange("google_ads_id", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Ex: AW-123456789"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Encontrado no Google Ads (ID da conta)
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      {tab === "smtp" && (
        <SmtpSection
          settings={settings}
          onChange={handleChange}
          onTest={handleTestSmtp}
          testing={testingSmtp}
          testResult={smtpTestResult}
        />
      )}

      {tab === "ia" && <AISection settings={settings} onChange={handleChange} />}

      {tab === "templates" && <TemplatesSection />}

      {tab === "logs" && <LogsSection />}

      {showSaveButton && (
        <div className="flex items-center justify-end gap-4">
          {saved && (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              <span>Salvo com sucesso!</span>
            </div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Configurações
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
}
