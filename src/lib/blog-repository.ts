import { query, queryOne } from "@/lib/db";
import { posts as mockPosts } from "@/app/blog/mock-posts";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  status: string;
  published_at: string;
  ai_generated: boolean;
  cover_image: string | null;
  seo_title: string | null;
  meta_description: string | null;
  agent?: string | null;
  cta_enabled?: boolean;
  scheduled_timezone?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

const POST_COLUMNS = `id, title, slug, content, excerpt, status,
  COALESCE(published_at, created_at) as published_at,
  ai_generated, cover_image, seo_title, meta_description, agent,
  cta_enabled, scheduled_timezone, created_at, updated_at`;

const VISIBLE_CLAUSE = `(
  (status = 'published' AND (published_at IS NULL OR published_at <= NOW()))
  OR (status = 'scheduled' AND published_at IS NOT NULL AND published_at <= NOW())
)`;

function normalize(row: BlogPost): BlogPost {
  return {
    ...row,
    published_at: row.published_at
      ? new Date(row.published_at).toISOString()
      : new Date().toISOString(),
    updated_at: row.updated_at
      ? new Date(row.updated_at).toISOString()
      : row.published_at
        ? new Date(row.published_at).toISOString()
        : null,
  };
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  try {
    const rows = await query<BlogPost>(
      `SELECT ${POST_COLUMNS}
       FROM posts
       WHERE ${VISIBLE_CLAUSE}
       ORDER BY published_at DESC, created_at DESC`
    );

    if (rows && rows.length > 0) {
      return rows.map(normalize);
    }
  } catch (error) {
    console.warn("Aviso ao buscar posts do banco, usando fallback:", error);
  }

  // Fallback editorial apenas para a listagem pública. O sitemap usa
  // `getSitemapPosts`, que nunca inclui estes posts de exemplo.
  return mockPosts.map((p) => ({
    ...p,
    content: null,
    cover_image: null,
    seo_title: null,
    meta_description: null,
    updated_at: p.published_at,
  }));
}

export async function getPublishedPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  try {
    const post = await queryOne<BlogPost>(
      `SELECT ${POST_COLUMNS}
       FROM posts
       WHERE slug = $1 AND ${VISIBLE_CLAUSE}
       LIMIT 1`,
      [slug]
    );

    if (post) return normalize(post);
  } catch (error) {
    console.warn("Aviso ao buscar post por slug:", error);
  }

  const mock = mockPosts.find((p) => p.slug === slug);
  if (mock) {
    return {
      ...mock,
      content: null,
      cover_image: null,
      seo_title: null,
      meta_description: null,
    };
  }

  return null;
}

/**
 * Posts publicados direto do banco, sem fallback de conteúdo de exemplo.
 * Usado pelo sitemap para não anunciar URLs que não existem de fato.
 */
export async function getSitemapPosts(): Promise<BlogPost[]> {
  try {
    const rows = await query<BlogPost>(
      `SELECT ${POST_COLUMNS}
       FROM posts
       WHERE ${VISIBLE_CLAUSE}
       ORDER BY published_at DESC`
    );

    return rows.map(normalize);
  } catch (error) {
    console.warn("Aviso ao carregar posts do sitemap:", error);
    return [];
  }
}
