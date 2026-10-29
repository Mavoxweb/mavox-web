"use client";

import { useState, useEffect } from "react";
import { Save, Check, Loader2, Key, Globe, Mail, Phone, MapPin, Shield, CreditCard, Zap } from "lucide-react";

interface Settings {
  openrouter_api_key: string;
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  whatsapp_number: string;
  meta_pixel_id: string;
  google_ads_id: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    openrouter_api_key: "",
    company_name: "Mavox",
    company_email: "contato@mavox.com.br",
    company_phone: "(21) 99999-9999",
    company_address: "",
    whatsapp_number: "5521992855872",
    meta_pixel_id: "",
    google_ads_id: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/painel/settings");
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field: keyof Settings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/painel/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao salvar configurações");
        setSaving(false);
        return;
      }

      setSaved(true);
      setSaving(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      setError("Erro ao salvar configurações");
      setSaving(false);
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

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-1">Gerencie configurações gerais do sistema</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Integração IA */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Zap className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Integração OpenRouter (IA)</h2>
            <p className="text-gray-500 text-sm">Chave de API para geração de artigos do blog com IA</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">OpenRouter API Key</label>
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={settings.openrouter_api_key}
              onChange={(e) => handleChange("openrouter_api_key", e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showApiKey ? <span className="text-sm">Ocultar</span> : <Key className="w-5 h-5" />}
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">Obtenha sua chave em <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">openrouter.ai/keys</a></p>
        </div>
      </section>

      {/* Informações da Empresa */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Globe className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Informações da Empresa</h2>
            <p className="text-gray-500 text-sm">Dados exibidos no site, e-mails e propostas</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa *</label>
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

      {/* Pixels de Rastreamento */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Pixels de Rastreamento</h2>
            <p className="text-gray-500 text-sm">IDs para Meta Ads (Facebook/Instagram) e Google Ads</p>
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
            <p className="mt-1 text-sm text-gray-500">Encontrado no Gerenciador de Eventos do Facebook</p>
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
            <p className="mt-1 text-sm text-gray-500">Encontrado no Google Ads (ID da conta)</p>
          </div>
        </div>
      </section>

      {/* Botão Salvar */}
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
    </form>
  );
}