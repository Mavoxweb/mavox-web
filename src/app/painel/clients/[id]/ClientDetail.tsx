"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, Building2, Calendar, Trash2, Edit, Plus, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  phone_e164: string | null;
  company: string | null;
  source: string;
  intent: string;
  created_at: string;
  category: string | null;
  niche: string | null;
  tier: string | null;
  tier_label: string | null;
  whatsapp_status: string | null;
  whatsapp_link: string | null;
  instagram_handle: string | null;
  instagram_url: string | null;
  instagram_followers: number | null;
  website: string | null;
  website_type: string | null;
  city: string | null;
  state: string | null;
  neighborhood: string | null;
  activity_estimate: string | null;
  google_reviews: number | null;
  google_rating: string | number | null;
  notes: string | null;
  approach_message: string | null;
  sources: string[] | null;
  objective: string | null;
  recommended_service: string | null;
  offer_code: string | null;
  raw_data: unknown;
  tags: { id: string; name: string; color: string }[];
}

interface Quote {
  id: string;
  code: string;
  status: string;
  total: number | null;
  created_at: string;
}

export function ClientDetail({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string; color: string }[]>([]);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "",
    intent: "",
    notes: "",
    tagIds: [] as string[],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [clientRes, tagsRes] = await Promise.all([
        fetch(`/api/painel/clients/${clientId}`, { credentials: 'include' }),
        fetch("/api/painel/tags?limit=50", { credentials: 'include' }),
      ]);

      if (!clientRes.ok) {
        if (clientRes.status === 404) {
          setError("Cliente não encontrado");
        } else {
          setError("Erro ao carregar cliente");
        }
        return;
      }

      const clientData = await clientRes.json();
      const tagsData = await tagsRes.json();

      setClient(clientData);
      setQuotes(clientData.quotes || []);
      setAvailableTags(tagsData.data || []);
      setEditData({
        name: clientData.name,
        email: clientData.email || "",
        phone: clientData.phone || "",
        company: clientData.company || "",
        source: clientData.source,
        intent: clientData.intent,
        notes: clientData.notes || "",
        tagIds: clientData.tags.map((t: { id: string }) => t.id),
      });
    } catch {
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTagChange = (tagId: string) => {
    setEditData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/painel/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(editData),
      });

      if (!res.ok) throw new Error("Erro ao salvar");
      setEditing(false);
      fetchData();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;
    try {
      const res = await fetch(`/api/painel/clients/${clientId}`, { method: "DELETE", credentials: 'include' });
      if (!res.ok) throw new Error("Erro ao excluir");
      router.push("/painel/clients");
    } catch {
      console.error("Erro ao excluir");
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "site": return "Site";
      case "apify": return "Apify";
      case "xlsx": return "Planilha";
      case "manual": return "Manual";
      case "google-ads": return "Google Ads";
      default: return source;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case "site": return "bg-green-100 text-green-800";
      case "apify": return "bg-violet-100 text-violet-800";
      case "xlsx": return "bg-purple-100 text-purple-800";
      case "manual": return "bg-blue-100 text-blue-800";
      case "google-ads": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getIntentLabel = (intent: string) => {
    switch (intent) {
      case "conhecer": return "Conhecer";
      case "avaliando": return "Avaliando";
      case "pronto_para_contratar": return "Pronto para Contratar";
      case "prospect": return "Prospect";
      default: return intent;
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case "conhecer": return "bg-gray-100 text-gray-800";
      case "avaliando": return "bg-yellow-100 text-yellow-800";
      case "pronto_para_contratar": return "bg-green-100 text-green-800";
      case "prospect": return "bg-indigo-100 text-indigo-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "novo": return "Novo";
      case "em_analise": return "Em Análise";
      case "proposta_enviada": return "Proposta Enviada";
      case "aprovado": return "Aprovado";
      case "recusado": return "Recusado";
      case "expirado": return "Expirado";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "novo": return "bg-blue-100 text-blue-800";
      case "em_analise": return "bg-yellow-100 text-yellow-800";
      case "proposta_enviada": return "bg-purple-100 text-purple-800";
      case "aprovado": return "bg-green-100 text-green-800";
      case "recusado": return "bg-red-100 text-red-800";
      case "expirado": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getWebsiteLabel = (type: string | null) => {
    switch (type) {
      case "nosite": return "Sem site";
      case "igonly": return "Só Instagram";
      case "link": return "Só link";
      case "template": return "Template";
      case "site_ig": return "Site + Instagram";
      case "site_noig": return "Site sem Instagram";
      default: return type || "—";
    }
  };

  const getWhatsappLabel = (status: string | null) => {
    switch (status) {
      case "confirmado": return "Confirmado";
      case "provavel": return "Provável";
      case "nao_identificado": return "Não identificado";
      default: return "—";
    }
  };

  const copyApproachMessage = async () => {
    if (!client?.approach_message) return;
    try {
      await navigator.clipboard.writeText(client.approach_message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900 mb-2">{error || "Cliente não encontrado"}</h2>
        <Link href="/painel/clients" className="text-blue-600 hover:text-blue-700">
          Voltar para lista
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/painel/clients" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {client.tier && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  client.tier === "A" ? "bg-sky-100 text-sky-800" : "bg-amber-100 text-amber-800"
                }`}>
                  Faixa {client.tier} · {client.tier === "A" ? "Site" : "Recorrente"}
                </span>
              )}
              <p className="text-gray-600">
                {[client.category, client.niche].filter(Boolean).join(" · ") || "Lead de prospecção"}
              </p>
              {client.city && (
                <p className="text-gray-500 text-sm">
                  {client.city}{client.state ? `/${client.state}` : ""}
                  {client.neighborhood ? ` · ${client.neighborhood}` : ""}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Salvar
              </button>
              <button
                onClick={() => {
                  setEditData({
                    name: client.name,
                    email: client.email || "",
                    phone: client.phone || "",
                    company: client.company || "",
                    source: client.source,
                    intent: client.intent,
                    notes: client.notes || "",
                    tagIds: client.tags.map((t: { id: string }) => t.id),
                  });
                  setEditing(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            </>
          )}
        </div>
      </div>

      {/* Client Info */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Enriched lead profile */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Perfil do lead</h2>

            {(client.objective || client.recommended_service) && (
              <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
                {client.objective && (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Objetivo</p>
                    <p className="text-sm text-blue-900 mb-3">{client.objective}</p>
                  </>
                )}
                {client.recommended_service && (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Serviço recomendado</p>
                    <p className="text-sm font-medium text-blue-900">{client.recommended_service}</p>
                  </>
                )}
              </div>
            )}

            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Faixa</dt>
                <dd className="mt-1 text-gray-900">{client.tier_label || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Categoria / nicho</dt>
                <dd className="mt-1 text-gray-900">
                  {[client.category, client.niche].filter(Boolean).join(" · ") || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Localização</dt>
                <dd className="mt-1 text-gray-900">
                  {client.city
                    ? `${client.city}${client.state ? `/${client.state}` : ""}${client.neighborhood ? ` · ${client.neighborhood}` : ""}`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">WhatsApp</dt>
                <dd className="mt-1 text-gray-900 flex items-center gap-2">
                  {client.whatsapp_status === "confirmado" ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Confirmado
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                      {getWhatsappLabel(client.whatsapp_status)}
                    </span>
                  )}
                  {client.phone && <span className="text-sm">{client.phone}</span>}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Instagram</dt>
                <dd className="mt-1 text-gray-900">
                  {client.instagram_handle ? (
                    <a
                      href={client.instagram_url || `https://www.instagram.com/${client.instagram_handle}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      @{client.instagram_handle}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-gray-500">Não identificado</span>
                  )}
                  {client.instagram_followers !== null && (
                    <span className="text-sm text-gray-500 ml-2">
                      {client.instagram_followers.toLocaleString("pt-BR")} seguidores
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Site ({getWebsiteLabel(client.website_type)})</dt>
                <dd className="mt-1 text-gray-900">
                  {client.website ? (
                    /^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(client.website.trim()) ? (
                      <a
                        href={`https://${client.website.trim().replace(/^https?:\/\//i, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 break-all"
                      >
                        {client.website}
                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                      </a>
                    ) : (
                      <span className="text-sm">{client.website}</span>
                    )
                  ) : (
                    <span className="text-gray-500">Não informado</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Google</dt>
                <dd className="mt-1 text-gray-900">
                  {client.google_reviews !== null ? (
                    <span>
                      {client.google_rating ?? "—"} ★ · {client.google_reviews} avaliações
                    </span>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tempo de atividade</dt>
                <dd className="mt-1 text-sm text-gray-900">{client.activity_estimate || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Observação</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{client.notes || "—"}</dd>
              </div>
              {client.sources && client.sources.length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Fontes</dt>
                  <dd className="mt-1 text-sm text-gray-600">{client.sources.join(" · ")}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Approach message */}
          {client.approach_message && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Mensagem de abordagem sugerida</h2>
                <button
                  onClick={copyApproachMessage}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 rounded-lg p-4">
                {client.approach_message}
              </p>
              <a
                href={`https://wa.me/${(client.phone_e164 || client.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(client.approach_message)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Abrir WhatsApp com esta mensagem
              </a>
            </div>
          )}

          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações</h2>
            {editing ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                    <input
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                    <input
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                    <input
                      value={editData.company}
                      onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Origem</label>
                    <select
                      value={editData.source}
                      onChange={(e) => setEditData({ ...editData, source: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="manual">Manual</option>
                      <option value="site">Site</option>
                      <option value="google-ads">Google Ads</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Intenção</label>
                    <select
                      value={editData.intent}
                      onChange={(e) => setEditData({ ...editData, intent: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="conhecer">Conhecer</option>
                      <option value="avaliando">Avaliando</option>
                      <option value="pronto_para_contratar">Pronto para Contratar</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagChange(tag.id)}
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                          editData.tagIds.includes(tag.id)
                            ? `bg-${tag.color.replace("#", "")} text-white border-transparent`
                            : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                        }`}
                        style={editData.tagIds.includes(tag.id) ? { backgroundColor: tag.color, borderColor: tag.color } : undefined}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
                  <textarea
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              <dl className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Origem</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSourceColor(client.source)}`}>
                        {getSourceLabel(client.source)}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Intenção</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getIntentColor(client.intent)}`}>
                        {getIntentLabel(client.intent)}
                      </span>
                    </dd>
                  </div>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.company && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <span>{client.company}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span>Cadastrado em {new Date(client.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
                {client.tags.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Tags</dt>
                    <dd className="mt-1 flex flex-wrap gap-1">
                      {client.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </div>

          {/* Quotes */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Orçamentos</h2>
              <Link
                href={`/painel/quotes?client=${clientId}`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Ver todos
              </Link>
            </div>
            {quotes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum orçamento para este cliente</p>
            ) : (
              <ul className="space-y-3">
                {quotes.map((quote) => (
                  <li key={quote.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <Link href={`/painel/quotes/${quote.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                        {quote.code}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {new Date(quote.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                      {getStatusLabel(quote.status)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <Link
                href={`/painel/quotes/new?client=${clientId}`}
                className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Novo Orçamento</span>
              </Link>
              <Link
                href={`/painel/appointments?client=${clientId}`}
                className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">Agendar Reunião</span>
              </Link>
              {(client.phone || client.phone_e164) && (
                <a
                  href={`https://wa.me/${(client.phone_e164 || client.phone || "").replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-900">
                    WhatsApp{client.whatsapp_status === "confirmado" ? " (confirmado)" : ""}
                  </span>
                </a>
              )}
              {client.email && (
                <a
                  href={`mailto:${client.email}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">E-mail</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}