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
  created_at?: string;
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  try {
    const rows = await query<BlogPost>(
      `SELECT id, title, slug, content, excerpt, status, 
              COALESCE(published_at, created_at) as published_at, 
              ai_generated, created_at 
       FROM posts 
       WHERE (status = 'published' AND (published_at IS NULL OR published_at <= NOW()))
          OR (status = 'scheduled' AND published_at IS NOT NULL AND published_at <= NOW())
       ORDER BY published_at DESC, created_at DESC`
    );

    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        ...r,
        published_at: r.published_at ? new Date(r.published_at).toISOString() : new Date().toISOString(),
      }));
    }
  } catch (error) {
    console.warn("Aviso ao buscar posts do banco, usando fallback:", error);
  }

  // Fallback para os posts iniciais caso a tabela esteja vazia ou em deploy estático
  return mockPosts.map((p) => ({
    ...p,
    content: null,
  }));
}

export async function getPublishedPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const post = await queryOne<BlogPost>(
      `SELECT id, title, slug, content, excerpt, status, 
              COALESCE(published_at, created_at) as published_at, 
              ai_generated, created_at 
       FROM posts 
       WHERE slug = $1
         AND (
           (status = 'published' AND (published_at IS NULL OR published_at <= NOW()))
           OR (status = 'scheduled' AND published_at IS NOT NULL AND published_at <= NOW())
         )
       LIMIT 1`,
      [slug]
    );

    if (post) {
      return {
        ...post,
        published_at: post.published_at ? new Date(post.published_at).toISOString() : new Date().toISOString(),
      };
    }
  } catch (error) {
    console.warn("Aviso ao buscar post por slug:", error);
  }

  const mock = mockPosts.find((p) => p.slug === slug);
  if (mock) {
    return {
      ...mock,
      content: null,
    };
  }

  return null;
}

