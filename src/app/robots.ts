import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const disallowedPrivate = ["/api/", "/painel/", "/painel/*", "/proposta/", "/proposta/*"];

  return {
    rules: [
      // Regras gerais para indexadores de busca (Googlebot, Bingbot, etc.)
      {
        userAgent: "*",
        allow: ["/", "/blog", "/blog/*", "/orcamento", "/privacidade", "/termos", "/llms.txt"],
        disallow: disallowedPrivate,
      },
      // OpenAI ChatGPT / GPTBot
      {
        userAgent: ["GPTBot", "ChatGPT-User"],
        allow: ["/", "/blog", "/blog/*", "/orcamento", "/llms.txt", "/llms-full.txt"],
        disallow: disallowedPrivate,
      },
      // Anthropic Claude
      {
        userAgent: "ClaudeBot",
        allow: ["/", "/blog", "/blog/*", "/orcamento", "/llms.txt", "/llms-full.txt"],
        disallow: disallowedPrivate,
      },
      // Google Gemini / Google-Extended
      {
        userAgent: "Google-Extended",
        allow: ["/", "/blog", "/blog/*", "/orcamento", "/llms.txt", "/llms-full.txt"],
        disallow: disallowedPrivate,
      },
      // Perplexity AI
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/blog", "/blog/*", "/orcamento", "/llms.txt", "/llms-full.txt"],
        disallow: disallowedPrivate,
      },
      // Apple Intelligence
      {
        userAgent: "Applebot-Extended",
        allow: ["/", "/blog", "/blog/*", "/orcamento", "/llms.txt", "/llms-full.txt"],
        disallow: disallowedPrivate,
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
