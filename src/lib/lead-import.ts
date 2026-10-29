/**
 * Normalização de leads importados (Apify / planilhas / cadastro manual).
 *
 * Regra de ouro: nada do payload original é descartado. Todo lead importado
 * carrega `rawData` com o objeto de origem intacto; os campos abaixo são
 * apenas uma visão estruturada para busca, filtros e próximas ações.
 */

export type WebsiteType =
  | "nosite"
  | "igonly"
  | "link"
  | "template"
  | "site_ig"
  | "site_noig";

export type Tier = "A" | "B";

export interface NormalizedLead {
  externalId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  phoneE164: string | null;
  company: string | null;
  source: string;
  intent: string;

  category: string | null;
  niche: string | null;
  tier: Tier | null;
  tierLabel: string | null;

  whatsappStatus: string | null;
  whatsappLink: string | null;

  instagramHandle: string | null;
  instagramUrl: string | null;
  instagramFollowers: number | null;

  website: string | null;
  websiteType: WebsiteType | null;

  city: string | null;
  state: string | null;
  neighborhood: string | null;

  activityEstimate: string | null;
  googleReviews: number | null;
  googleRating: number | null;

  notes: string | null;
  approachMessage: string | null;
  sources: string[];

  objective: string | null;
  recommendedService: string | null;
  offerCode: string | null;

  tagNames: string[];
  tagIds: string[];

  rawData: unknown;
}

const WEBSITE_TYPES: WebsiteType[] = [
  "nosite",
  "igonly",
  "link",
  "template",
  "site_ig",
  "site_noig",
];

const OFFERS: Record<WebsiteType, { code: string; label: string }> = {
  nosite: { code: "site_landing", label: "Site profissional + landing page (não tem site)" },
  igonly: { code: "site_landing", label: "Site profissional + landing page (hoje só Instagram)" },
  link: { code: "site_landing", label: "Site profissional (substituir página de links)" },
  template: { code: "site_landing", label: "Site profissional (substituir template)" },
  site_noig: { code: "site_social", label: "Site + gestão de Instagram" },
  site_ig: { code: "traffic", label: "Landing page de conversão + tráfego pago" },
};

const CATEGORY_TAGS: Record<string, string> = {
  "odontologia": "#2563eb",
  "estética e harmonização": "#db2777",
  "fisioterapia e pilates": "#16a34a",
  "nutrição": "#65a30d",
  "veterinária": "#0d9488",
};

function text(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function integer(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  if (typeof value === "string") {
    const parsed = Number(value.replace(/\./g, "").replace(",", "."));
    if (Number.isFinite(parsed)) return Math.round(parsed);
  }
  return null;
}

function decimal(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(",", "."));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function object(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function pick(raw: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    const value = raw[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

/** Normaliza para E.164 brasileiro (+55DDNNNNNNNNN). */
export function normalizePhoneE164(value: string | null | undefined): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;

  const withCountry =
    digits.length === 10 || digits.length === 11
      ? `55${digits}`
      : digits.startsWith("55")
        ? digits
        : `55${digits}`;

  if (withCountry.length < 12 || withCountry.length > 15) return null;
  return `+${withCountry}`;
}

function normalizeTier(value: unknown): Tier | null {
  const tier = text(value)?.toUpperCase();
  if (tier === "A" || tier === "B") return tier;
  return null;
}

function normalizeWebsiteType(value: unknown): WebsiteType | null {
  const type = text(value)?.toLowerCase();
  if (!type) return null;
  if ((WEBSITE_TYPES as string[]).includes(type)) return type as WebsiteType;
  // variações comuns vindas de planilhas
  if (type === "sem_site" || type === "no_site") return "nosite";
  if (type === "instagram") return "igonly";
  if (type === "site") return "site_noig";
  return null;
}

export function deriveObjective(tier: Tier | null): string | null {
  if (tier === "A") return "Projeto único: site / landing page";
  if (tier === "B") return "Recorrência: presença digital + tráfego pago";
  return null;
}

export function deriveOffer(
  websiteType: WebsiteType | null,
  tier: Tier | null
): { code: string | null; label: string | null } {
  if (!websiteType) return { code: null, label: null };
  const base = OFFERS[websiteType];
  if (tier === "B" && base.code !== "traffic") {
    return {
      code: `${base.code}_traffic`,
      label: `${base.label} + tráfego pago recorrente`,
    };
  }
  return { code: base.code, label: base.label };
}

function categoryColor(category: string): string {
  const known = CATEGORY_TAGS[category.toLowerCase()];
  if (known) return known;
  const palette = ["#4f46e5", "#0891b2", "#c026d3", "#ea580c", "#059669", "#7c3aed"];
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) % 9973;
  return palette[hash % palette.length];
}

export function tagColor(name: string): string {
  if (name === "Apify") return "#7c3aed";
  if (name === "Faixa A") return "#0284c7";
  if (name === "Faixa B") return "#d97706";
  return categoryColor(name);
}

/**
 * Converte um registro bruto em lead estruturado. Aceita o formato Apify
 * (`nome`, `telefone_e164`, `site.tipo`...) e o formato legado (`name`, `phone`...).
 */
export function normalizeLead(input: unknown, origin = "apify"): NormalizedLead {
  const raw = object(input) ?? {};
  const instagram = object(pick(raw, "instagram"));
  const whatsapp = object(pick(raw, "whatsapp"));
  const site = object(pick(raw, "site"));
  const location = object(pick(raw, "localizacao", "location"));
  const sourcesRaw = pick(raw, "fonte", "sources");

  const name = text(pick(raw, "nome", "name")) ?? "";
  const phone = text(pick(raw, "telefone", "phone", "whatsapp"));
  const phoneE164 =
    normalizePhoneE164(text(pick(raw, "telefone_e164", "phone_e164"))) ??
    normalizePhoneE164(phone);

  const tier = normalizeTier(pick(raw, "faixa", "tier"));
  const tierLabel = text(pick(raw, "faixa_descricao", "tier_label"));
  const websiteType = normalizeWebsiteType(
    site ? site.tipo : pick(raw, "website_type", "site_tipo")
  );
  const website = site
    ? text(pick(site, "url_ou_descricao", "url", "descricao"))
    : text(pick(raw, "website", "site"));
  const offer = deriveOffer(websiteType, tier);

  const sources = Array.isArray(sourcesRaw)
    ? sourcesRaw.map((item) => text(item)).filter((item): item is string => Boolean(item))
    : text(sourcesRaw)
      ? [text(sourcesRaw) as string]
      : [];

  const category = text(pick(raw, "categoria", "category"));
  const tagNames = [
    ...(origin === "apify" ? ["Apify"] : []),
    ...(tier ? [`Faixa ${tier}`] : []),
    ...(category ? [category] : []),
  ];

  const intent = text(pick(raw, "intent", "intencao")) ?? (origin === "apify" ? "prospect" : "conhecer");
  const source = text(pick(raw, "source", "origem")) ?? (origin === "apify" ? "apify" : "manual");

  return {
    externalId: text(pick(raw, "id", "external_id", "externalId")),
    name,
    email: text(pick(raw, "email", "e_mail")),
    phone,
    phoneE164,
    company: text(pick(raw, "company", "empresa")),
    source,
    intent,

    category,
    niche: text(pick(raw, "nicho_detalhe", "niche", "nicho")),
    tier,
    tierLabel,

    whatsappStatus: whatsapp
      ? text(pick(whatsapp, "status"))
      : text(pick(raw, "whatsapp_status")),
    whatsappLink: whatsapp
      ? text(pick(whatsapp, "link"))
      : text(pick(raw, "whatsapp_link")),

    instagramHandle: instagram
      ? text(pick(instagram, "handle"))
      : text(pick(raw, "instagram_handle")),
    instagramUrl: instagram
      ? text(pick(instagram, "url"))
      : text(pick(raw, "instagram_url")),
    instagramFollowers: instagram
      ? integer(pick(instagram, "seguidores", "followers"))
      : integer(pick(raw, "instagram_followers")),

    website,
    websiteType,

    city: location ? text(pick(location, "cidade", "city")) : text(pick(raw, "city")),
    state: location ? text(pick(location, "uf", "state")) : text(pick(raw, "state")),
    neighborhood: location
      ? text(pick(location, "bairro", "neighborhood"))
      : text(pick(raw, "neighborhood")),

    activityEstimate: text(pick(raw, "tempo_atividade_estimado", "activity_estimate")),
    googleReviews: integer(pick(raw, "avaliacoes_google", "google_reviews")),
    googleRating: decimal(pick(raw, "nota_google", "google_rating")),

    notes: text(pick(raw, "observacao", "notes")),
    approachMessage: text(pick(raw, "mensagem_abordagem_sugerida", "approach_message")),
    sources,

    objective: text(pick(raw, "objetivo", "objective")) ?? deriveObjective(tier),
    recommendedService:
      text(pick(raw, "servico_recomendado", "recommended_service")) ?? offer.label,
    offerCode: text(pick(raw, "offer_code")) ?? offer.code,

    tagNames,
    tagIds: Array.isArray(raw.tagIds)
      ? raw.tagIds.map((item) => text(item)).filter((item): item is string => Boolean(item))
      : [],
    rawData: input,
  };
}

export function validateLead(lead: NormalizedLead): string[] {
  const errors: string[] = [];
  if (!lead.name) errors.push("Nome é obrigatório");
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    errors.push(`E-mail inválido: ${lead.email}`);
  }
  if (lead.googleRating !== null && (lead.googleRating < 0 || lead.googleRating > 5)) {
    errors.push(`Nota do Google fora do intervalo: ${lead.googleRating}`);
  }
  return errors;
}

export interface LeadImportMeta {
  title: string | null;
  generatedAt: string | null;
  raw: Record<string, unknown>;
}

export function normalizeImportMeta(meta: unknown): LeadImportMeta | null {
  const raw = object(meta);
  if (!raw) return null;
  const generatedAt = text(pick(raw, "gerado_em", "generated_at"));
  return {
    title: text(pick(raw, "titulo", "title")),
    generatedAt: generatedAt && /^\d{4}-\d{2}-\d{2}$/.test(generatedAt) ? generatedAt : null,
    raw,
  };
}
