import { queryOne } from "@/lib/db";
import {
  BLOG_TIMEZONES,
  DEFAULT_TIMEZONE,
  autoExcerpt,
  isBlogAgent,
  normalizeSlug,
  sanitizeHtml,
  zonedInputToUtc,
} from "@/lib/blog-content";

export type PostStatus = "draft" | "published" | "scheduled";

export interface NormalizedPostInput {
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  status: PostStatus;
  published_at: string | null;
  ai_generated: boolean;
  cover_image: string | null;
  seo_title: string | null;
  meta_description: string | null;
  agent: string;
  cta_enabled: boolean;
  scheduled_timezone: string;
}

export type ParseResult =
  | { ok: true; values: NormalizedPostInput }
  | { ok: false; error: string; field?: string };

const VALID_STATUSES: PostStatus[] = ["draft", "published", "scheduled"];
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function text(value: unknown, max = 400): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function optionalText(value: unknown, max = 400): string | null {
  const parsed = text(value, max);
  return parsed || null;
}

/**
 * Valida e normaliza o corpo de criação/edição de artigo.
 * Centraliza as regras para POST e PUT não divergirem.
 */
export async function parsePostInput(
  body: Record<string, unknown>,
  existingId?: string
): Promise<ParseResult> {
  const title = text(body.title, 200);
  if (!title) return { ok: false, error: "Título é obrigatório.", field: "title" };

  const rawSlug = text(body.slug, 120) || title;
  const slug = normalizeSlug(rawSlug);
  if (!slug || !SLUG_RE.test(slug)) {
    return {
      ok: false,
      error: "Slug inválido. Use apenas letras, números e hífens.",
      field: "slug",
    };
  }

  const duplicate = await queryOne<{ id: string }>(
    `SELECT id FROM posts WHERE slug = $1 AND ($2::uuid IS NULL OR id <> $2::uuid) LIMIT 1`,
    [slug, existingId ?? null]
  );
  if (duplicate) {
    return { ok: false, error: "Já existe um artigo com este slug.", field: "slug" };
  }

  const status = VALID_STATUSES.includes(body.status as PostStatus)
    ? (body.status as PostStatus)
    : "draft";

  const scheduledTimezone = BLOG_TIMEZONES.some(
    (tz) => tz.id === body.scheduled_timezone
  )
    ? (body.scheduled_timezone as string)
    : DEFAULT_TIMEZONE;

  let publishedAt: Date | null = null;
  const localInput =
    typeof body.published_at_local === "string" ? body.published_at_local : "";
  const isoInput =
    typeof body.published_at === "string" ? body.published_at : "";

  if (localInput) {
    publishedAt = zonedInputToUtc(localInput, scheduledTimezone);
  } else if (isoInput) {
    const parsed = new Date(isoInput);
    if (!Number.isNaN(parsed.getTime())) publishedAt = parsed;
  }

  if (status === "draft") {
    publishedAt = null;
  } else if (status === "scheduled") {
    if (!publishedAt) {
      return {
        ok: false,
        error: "Informe a data e a hora do agendamento.",
        field: "published_at",
      };
    }
    if (publishedAt.getTime() <= Date.now()) {
      return {
        ok: false,
        error: "O agendamento precisa estar no futuro.",
        field: "published_at",
      };
    }
  } else if (!publishedAt) {
    // Publicação imediata.
    publishedAt = new Date();
  }

  const rawContent = typeof body.content === "string" ? body.content : "";
  const content = rawContent.trim() ? sanitizeHtml(rawContent) : null;

  const excerpt =
    optionalText(body.excerpt, 400) ||
    (content ? autoExcerpt(content, 300) : null);

  return {
    ok: true,
    values: {
      title,
      slug,
      content,
      excerpt,
      status,
      published_at: publishedAt ? publishedAt.toISOString() : null,
      ai_generated: Boolean(body.ai_generated),
      cover_image: optionalText(body.cover_image, 1000),
      seo_title: optionalText(body.seo_title, 200),
      meta_description: optionalText(body.meta_description, 400),
      agent: isBlogAgent(body.agent) ? body.agent : "blog_writer",
      cta_enabled: body.cta_enabled === undefined ? true : Boolean(body.cta_enabled),
      scheduled_timezone: scheduledTimezone,
    },
  };
}
