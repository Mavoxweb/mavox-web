"use client";

import { useState } from "react";
import { Loader2, Mail, Send, CheckCircle, AlertCircle } from "lucide-react";

interface SmtpSectionProps {
  settings: {
    smtp_host: string;
    smtp_port: number;
    smtp_user: string;
    smtp_password: string;
    smtp_secure: boolean;
    smtp_from_name: string;
    smtp_from_email: string;
    company_name: string;
    company_email: string;
  };
  onChange: (field: string, value: string | number | boolean) => void;
  onTest: (to: string) => Promise<void>;
  testing: boolean;
  testResult: { ok: boolean; message: string } | null;
}

export default function SmtpSection({
  settings,
  onChange,
  onTest,
  testing,
  testResult,
}: SmtpSectionProps) {
  const [testTo, setTestTo] = useState("");

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-sky-100 rounded-lg">
          <Mail className="w-5 h-5 text-sky-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Servidor de E-mail (SMTP)</h2>
          <p className="text-gray-500 text-sm">
            Usado para propostas, cold outreach, follow-ups, onboarding e cobranças
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Host SMTP *</label>
          <input
            type="text"
            value={settings.smtp_host}
            onChange={(e) => onChange("smtp_host", e.target.value)}
            placeholder="smtp.gmail.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Porta</label>
          <input
            type="number"
            value={settings.smtp_port}
            onChange={(e) => onChange("smtp_port", Number(e.target.value))}
            placeholder="587"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">587 (TLS) ou 465 (SSL)</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
          <input
            type="text"
            value={settings.smtp_user}
            onChange={(e) => onChange("smtp_user", e.target.value)}
            placeholder="contato@mavox.com.br"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Senha / App Password</label>
          <input
            type="password"
            value={settings.smtp_password}
            onChange={(e) => onChange("smtp_password", e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome do remetente</label>
          <input
            type="text"
            value={settings.smtp_from_name}
            onChange={(e) => onChange("smtp_from_name", e.target.value)}
            placeholder={settings.company_name || "Mavox"}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail do remetente</label>
          <input
            type="email"
            value={settings.smtp_from_email}
            onChange={(e) => onChange("smtp_from_email", e.target.value)}
            placeholder={settings.company_email || "contato@mavox.com.br"}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <label className="flex items-center gap-3 md:col-span-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={settings.smtp_secure}
            onChange={(e) => onChange("smtp_secure", e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          Conexão segura (SSL/TLS direto na porta 465)
        </label>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[240px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enviar e-mail de teste para
            </label>
            <input
              type="email"
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => onTest(testTo)}
            disabled={testing}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Testar conexão
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          O teste salva as configurações atuais antes de conectar. Deixe o e-mail em branco para
          testar apenas a conexão.
        </p>

        {testResult && (
          <div
            className={`mt-4 flex items-start gap-2 p-3 rounded-lg border text-sm ${
              testResult.ok
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {testResult.ok ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}
      </div>
    </section>
  );
}
