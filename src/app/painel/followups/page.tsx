"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, CheckCircle2, AlertCircle, MessageSquare, Send, Phone, Play, Loader2, Settings, Trash2, Edit, Plus, Save } from "lucide-react";
import Link from "next/link";

interface FollowUp {
  id: string;
  rule_id: string;
  lead_id: string | null;
  quote_id: string | null;
  status: string;
  channel: string;
  executed_at: string | null;
  response_received: boolean;
  created_at: string;
  rule_name?: string;
  lead_name?: string;
  lead_phone?: string | null;
  quote_code?: string;
}

interface FollowUpRule {
  id: string;
  name: string;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  message_template: string;
  channel: string;
  active: boolean;
  created_at: string;
}

export default function FollowUpsPage() {
  const [items, setItems] = useState<FollowUp[]>([]);
  const [rules, setRules] = useState<FollowUpRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<FollowUpRule | null>(null);
  const [ruleForm, setRuleForm] = useState<{
    name: string;
    trigger_type: string;
    trigger_config: { days: number; min_viewed: boolean };
    message_template: string;
    channel: string;
    active: boolean;
  }>({
    name: "",
    trigger_type: "no_response",
    trigger_config: { days: 2, min_viewed: true },
    message_template: "",
    channel: "whatsapp",
    active: true,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, rulesRes] = await Promise.all([
        fetch("/api/painel/followups", { credentials: "include" }),
        fetch("/api/painel/followup-rules", { credentials: "include" }),
      ]);
      const itemsData = await itemsRes.json();
      const rulesData = await rulesRes.json();
      setItems(itemsData.data || []);
      setRules(rulesData.data || []);
    } catch {
      setItems([]);
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const handleOpenRuleModal = (rule?: FollowUpRule) => {
    if (rule) {
      setEditingRule(rule);
      setRuleForm({
        name: rule.name,
        trigger_type: rule.trigger_type,
        trigger_config: rule.trigger_config as { days: number; min_viewed: boolean },
        message_template: rule.message_template,
        channel: rule.channel,
        active: rule.active,
      });
    } else {
      setEditingRule(null);
      setRuleForm({
        name: "",
        trigger_type: "no_response",
        trigger_config: { days: 2, min_viewed: true },
        message_template: "",
        channel: "whatsapp",
        active: true,
      });
    }
    setShowRuleModal(true);
  };

  const handleRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingRule
        ? `/api/painel/followup-rules/${editingRule.id}`
        : "/api/painel/followup-rules";
      const method = editingRule ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(ruleForm),
      });

      if (!res.ok) throw new Error("Erro ao salvar regra");

      setShowRuleModal(false);
      setEditingRule(null);
      fetchData();
    } catch (error) {
      console.error("Erro ao salvar regra:", error);
      alert("Erro ao salvar regra");
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta regra?")) return;
    try {
      const res = await fetch(`/api/painel/followup-rules/${ruleId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erro ao excluir");
      fetchData();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir regra");
    }
  };

  const triggerFollowUp = async (rule: FollowUpRule) => {
    try {
      const res = await fetch("/api/cron/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ trigger_rule_id: rule.id }),
      });
      if (!res.ok) throw new Error("Erro ao disparar");
      fetchData();
    } catch (error) {
      console.error("Erro ao disparar follow-up:", error);
      alert("Erro ao disparar follow-up");
    }
  };

  const filtered = items.filter((i) =>
    tab === "pending" ? i.status === "pending" || i.status === "sent" : i.status === tab
  );

  const TRIGGER_LABELS: Record<string, string> = {
    no_response: "Sem resposta",
    stage_stale: "Estágio parado",
    contract_pending: "Contrato pendente",
    meeting_needed: "Reunião necessária",
    re_engage: "Re-engajamento",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Follow-ups</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Acompanhamento automático de propostas e leads.</p>
        </div>
        <button onClick={() => handleOpenRuleModal()} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Nova Regra
        </button>
      </div>

      {/* Regras Cadastradas */}
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-[#e2e8f0] dark:border-[#334155] overflow-hidden">
        <div className="p-4 border-b border-[#e2e8f0] dark:border-[#334155]">
          <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>Regras de Automação</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f8fafc] dark:bg-[#0f172a] border-b border-[#e2e8f0] dark:border-[#334155]">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Regra</th>
                <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Gatilho</th>
                <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Canal</th>
                <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] dark:divide-[#334155]">
              {rules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                    Nenhuma regra configurada. Clique em "Nova Regra" para criar.
                  </td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-[#f8fafc] dark:hover:bg-[#334155]/30">
                    <td className="px-4 py-3">
                      <p className="font-medium" style={{ color: "var(--text)" }}>{rule.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{rule.message_template.slice(0, 60)}...</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                        style={{ background: "rgba(59,130,246,0.15)", color: "rgb(96,165,250)" }}>
                        {TRIGGER_LABELS[rule.trigger_type] || rule.trigger_type}
                      </span>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                        {JSON.stringify(rule.trigger_config)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                        {rule.channel === "whatsapp" ? <MessageSquare className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                        {rule.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        rule.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}>
                        {rule.active ? "Ativa" : "Inativa"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => triggerFollowUp(rule)}
                          className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          title="Disparar agora"
                        >
                          <Play className="w-4 h-4" style={{ color: "var(--accent)" }} />
                        </button>
                        <button
                          onClick={() => handleOpenRuleModal(rule)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" style={{ color: "var(--bad)" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Execuções de Follow-up */}
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-[#e2e8f0] dark:border-[#334155] overflow-hidden">
        <div className="flex gap-1 px-4 pt-4">
          {["pending", "replied", "failed"].map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === t ? "bg-blue-600 text-white" : "text-[#475569] dark:text-[#94a3b8] hover:bg-[#f8fafc] dark:hover:bg-[#334155]"}`}>
              {t === "pending" ? "Pendentes" : t === "replied" ? "Respondidos" : "Falharam"}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f8fafc] dark:bg-[#0f172a] border-y border-[#e2e8f0] dark:border-[#334155]">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Regra / Lead</th>
                <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Proposta</th>
                <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Canal</th>
                <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] dark:divide-[#334155]">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center" style={{ color: "var(--text-muted)" }}>Carregando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center" style={{ color: "var(--text-muted)" }}>Nenhum item.</td></tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f8fafc] dark:hover:bg-[#334155]/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {item.status === "replied" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : item.status === "failed" ? <AlertCircle className="w-4 h-4 text-red-600" /> : <Clock className="w-4 h-4 text-amber-500" />}
                        <span className="font-medium text-xs" style={{ color: "var(--text)" }}>
                          {item.rule_name || `Regra ${item.rule_id?.slice(0, 8)}`}
                        </span>
                      </div>
                      {item.lead_name && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.lead_name}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {item.quote_code ? (
                        <span className="font-mono text-xs" style={{ color: "var(--text)" }}>{item.quote_code}</span>
                      ) : (
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.status === "replied" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : item.status === "failed" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          : item.status === "sent" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                        {item.channel === "whatsapp" ? <MessageSquare className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                        {item.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(item.created_at).toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova/Editar Regra */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>
                {editingRule ? "Editar Regra" : "Nova Regra de Follow-up"}
              </h2>
              <button onClick={() => { setShowRuleModal(false); setEditingRule(null); }} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <span className="w-5 h-5" style={{ color: "var(--text-muted)" }}>×</span>
              </button>
            </div>

            <form onSubmit={handleRuleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Nome da Regra *</label>
                <input
                  type="text"
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                  placeholder="Ex: No Response 1 - Proposta visualizada"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Tipo de Gatilho *</label>
                  <select
                    value={ruleForm.trigger_type}
                    onChange={(e) => setRuleForm({ ...ruleForm, trigger_type: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                  >
                    <option value="no_response">Sem resposta (proposta visualizada)</option>
                    <option value="stage_stale">Estágio parado</option>
                    <option value="contract_pending">Contrato pendente</option>
                    <option value="meeting_needed">Reunião necessária</option>
                    <option value="re_engage">Re-engajamento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Canal *</label>
                  <select
                    value={ruleForm.channel}
                    onChange={(e) => setRuleForm({ ...ruleForm, channel: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">E-mail</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Configuração do Gatilho (JSON)</label>
                <textarea
                  value={JSON.stringify(ruleForm.trigger_config, null, 2)}
                  onChange={(e) => {
                    try {
                      setRuleForm({ ...ruleForm, trigger_config: JSON.parse(e.target.value) });
                    } catch { }
                  }}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
                  style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                  placeholder='{"days": 2, "min_viewed": true}'
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Template da Mensagem *</label>
                <textarea
                  value={ruleForm.message_template}
                  onChange={(e) => setRuleForm({ ...ruleForm, message_template: e.target.value })}
                  rows={3}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                  placeholder="Vimos que você abriu nossa proposta. Quer falar sobre os próximos passos?"
                />
              </div>

              <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
                <input
                  type="checkbox"
                  checked={ruleForm.active}
                  onChange={(e) => setRuleForm({ ...ruleForm, active: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Ativa
              </label>

              <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                <button type="button" onClick={() => { setShowRuleModal(false); setEditingRule(null); }} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingRule ? "Salvar Alterações" : "Criar Regra"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}