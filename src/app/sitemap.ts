import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getSitemapPosts } from "@/lib/blog-repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Rotas estáticas principais
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE.url}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE.url}/orcamento`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE.url}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE.url}/privacidade`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE.url}/termos`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Rotas dinâmicas do Blog (carregadas em tempo real do banco de dados)
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await getSitemapPosts();
    blogRoutes = posts.map((post) => ({
      url: `${SITE.url}/blog/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : (post.published_at ? new Date(post.published_at) : now),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (error) {
    console.warn("Aviso ao gerar sitemap dos posts do blog:", error);
  }

  return [...staticRoutes, ...blogRoutes];
}
