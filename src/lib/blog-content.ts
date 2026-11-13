import { marked } from "marked";
import { SITE, whatsappLink } from "@/lib/site";
import { claimCopy } from "@/data/claims";

/**
 * Utilitários de conteúdo do blog.
 *
 * O editor rico salva HTML em `posts.content`. Conteúdo antigo/gerado por IA
 * pode estar em markdown: `contentToHtml` detecta e converte.
 */

const HTML_BLOCK_RE = /<(p|h[1-6]|ul|ol|blockquote|pre|figure|div|img|hr|table)\b/i;

export function isHtmlContent(value: string): boolean {
  return HTML_BLOCK_RE.test(value);
}

export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"')
    .replace(/(href|src)\s*=\s*javascript:[^\s>]+/gi, '$1="#"');
}

export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, {
    async: false,
    gfm: true,
    breaks: false,
  }) as string;
}

export function contentToHtml(content: string | null | undefined): string {
  if (!content) return "";
  const raw = isHtmlContent(content) ? content : markdownToHtml(content);
  return sanitizeHtml(raw);
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function autoExcerpt(html: string, maxLength = 160): string {
  const text = stripHtml(html);
  if (text.length <= maxLength) return text;

  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${base.trim()}…`;
}

export function readingTimeMinutes(html: string): number {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function normalizeSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildCtaHtml(kind: "mid" | "end" | "manual"): string {
  const copy =
    kind === "end"
      ? {
          title: "Pronto para tirar seu projeto do papel?",
          text: claimCopy.blogCta,
        }
      : {
          title: "Quer transformar esse conteúdo em resultado?",
          text: "A Mavox cria sites, landing pages e campanhas focadas em gerar orçamentos reais para o seu negócio.",
        };

  const wa = whatsappLink(
    "Olá! Li o artigo no blog da Mavox e gostaria de falar sobre um projeto."
  );

  return `<div class="blog-cta" data-blog-cta="${kind}">
  <div class="blog-cta-copy">
    <p class="blog-cta-kicker">Fale com a Mavox</p>
    <h3>${copy.title}</h3>
    <p>${copy.text}</p>
  </div>
  <div class="blog-cta-actions">
    <a class="blog-cta-btn blog-cta-btn-primary" href="/orcamento">Solicite Orçamento</a>
    <a class="blog-cta-btn blog-cta-btn-whatsapp" href="${wa}" target="_blank" rel="noopener noreferrer">Fale no WhatsApp</a>
  </div>
</div>`;
}

const MANUAL_CTA_RE =
  /<div[^>]*data-blog-cta=["']manual["'][^>]*>\s*<\/div>/gi;

/**
 * Injeta CTAs automáticos no meio e no fim do artigo.
 * Marcadores manuais inseridos pelo editor são substituídos pelo CTA real.
 */
export function injectCtas(html: string, enabled = true): string {
  if (!html) return "";

  let output = html.replace(MANUAL_CTA_RE, buildCtaHtml("manual"));
  if (!enabled) return output;

  // CTA do meio: após o bloco que cruza a metade do texto.
  const half = Math.floor(output.length / 2);
  const blockEnd = /<\/(p|h2|h3|ul|ol|blockquote|figure|table)>/gi;
  blockEnd.lastIndex = half;
  const match = blockEnd.exec(output);
  const insertAt = match ? match.index + match[0].length : output.length;

  output =
    output.slice(0, insertAt) + buildCtaHtml("mid") + output.slice(insertAt);

  // CTA final.
  output += buildCtaHtml("end");

  return output;
}

export const BLOG_AGENTS = [
  {
    id: "blog_writer",
    label: "Blog Writer",
    description: "Artigo completo, didático e otimizado para conversão.",
  },
  {
    id: "seo_specialist",
    label: "SEO Specialist",
    description: "Reescreve o conteúdo com foco em palavras-chave e estrutura.",
  },
  {
    id: "case_study_writer",
    label: "Case Study Writer",
    description: "Estrutura de estudo de caso: contexto, desafio, solução e resultados.",
  },
] as const;

export type BlogAgentId = (typeof BLOG_AGENTS)[number]["id"];

export function isBlogAgent(value: unknown): value is BlogAgentId {
  return BLOG_AGENTS.some((agent) => agent.id === value);
}

export const BLOG_TIMEZONES = [
  { id: "America/Sao_Paulo", label: "Brasília / Rio / São Paulo (GMT-3)" },
  { id: "America/Manaus", label: "Manaus (GMT-4)" },
  { id: "America/Cuiaba", label: "Cuiabá (GMT-4)" },
  { id: "America/Porto_Velho", label: "Porto Velho (GMT-4)" },
  { id: "America/Belem", label: "Belém (GMT-3)" },
  { id: "America/Fortaleza", label: "Fortaleza (GMT-3)" },
  { id: "America/Recife", label: "Recife (GMT-3)" },
  { id: "America/Noronha", label: "Fernando de Noronha (GMT-2)" },
  { id: "America/Rio_Branco", label: "Rio Branco (GMT-5)" },
  { id: "UTC", label: "UTC" },
] as const;

export type BlogTimezone = (typeof BLOG_TIMEZONES)[number]["id"];

export const DEFAULT_TIMEZONE: BlogTimezone = "America/Sao_Paulo";

function zoneParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

function zoneOffsetMs(date: Date, timeZone: string): number {
  const p = zoneParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - date.getTime();
}

/** Converte "2026-11-02T09:30" no fuso informado para um instante UTC. */
export function zonedInputToUtc(local: string, timeZone: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(local)) return null;

  const [datePart, timePart] = local.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.slice(0, 5).split(":").map(Number);

  const wallMs = Date.UTC(year, month - 1, day, hour, minute, 0);
  let utc = wallMs - zoneOffsetMs(new Date(wallMs), timeZone);
  utc = wallMs - zoneOffsetMs(new Date(utc), timeZone);

  return new Date(utc);
}

/** Formata um ISO UTC para o valor de <input type="datetime-local"> no fuso. */
export function utcToZonedInput(iso: string | null, timeZone: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const p = zoneParts(date, timeZone);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

export function formatZonedDateTime(iso: string | null, timeZone: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone,
  }).format(date);
}

export function timezoneLabel(timeZone: string): string {
  return BLOG_TIMEZONES.find((tz) => tz.id === timeZone)?.label ?? timeZone;
}
