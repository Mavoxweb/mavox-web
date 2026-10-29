"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Save, Check, Eye, Code } from "lucide-react";

interface Template {
  key: string;
  name: string;
  subject: string;
  body_html: string;
}

const PLACEHOLDERS = [
  "{{nome}}",
  "{{empresa}}",
  "{{servico}}",
  "{{valor}}",
  "{{prazo}}",
  "{{link}}",
];

export default function TemplatesSection() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeKey, setActiveKey] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/painel/email-templates", { credentials: "include" });
      const data = await res.json();
      const list: Template[] = data.data || [];
      setTemplates(list);
      setActiveKey((current) => current || list[0]?.key || "");
    } catch {
      setError("Erro ao carregar templates.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const active = templates.find((template) => template.key === activeKey);

  const updateActive = (field: keyof Template, value: string) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.key === activeKey ? { ...template, [field]: value } : template
      )
    );
    setSaved(false);
  };

  const handleSave = async () => {
    if (!active) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/painel/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(active),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao salvar template.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Erro ao salvar template.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 flex items-center justify-center gap-3 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin" /> Carregando templates...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Templates de E-mail</h2>
        <p className="text-gray-500 text-sm">
          Personalize assunto e corpo dos e-mails automáticos. Use as variáveis abaixo.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {templates.map((template) => (
          <button
            key={template.key}
            type="button"
            onClick={() => {
              setActiveKey(template.key);
              setPreview(false);
              setError("");
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              activeKey === template.key
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
            }`}
          >
            {template.name}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">
          {error}
        </div>
      )}

      {active && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={active.name}
                onChange={(e) => updateActive("name", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
              <input
                type="text"
                value={active.subject}
                onChange={(e) => updateActive("subject", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Corpo (HTML ou texto)
              </label>
              <button
                type="button"
                onClick={() => setPreview(!preview)}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                {preview ? <Code className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {preview ? "Editar código" : "Pré-visualizar"}
              </button>
            </div>
            {preview ? (
              <div
                className="border border-gray-200 rounded-lg p-4 min-h-[220px] prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: active.body_html }}
              />
            ) : (
              <textarea
                value={active.body_html}
                onChange={(e) => updateActive("body_html", e.target.value)}
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="font-medium text-gray-600">Variáveis:</span>
            {PLACEHOLDERS.map((placeholder) => (
              <button
                key={placeholder}
                type="button"
                onClick={() => updateActive("body_html", `${active.body_html}${placeholder}`)}
                className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 font-mono"
                title="Inserir no final do corpo"
              >
                {placeholder}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <Check className="w-4 h-4" /> Template salvo
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar template
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
