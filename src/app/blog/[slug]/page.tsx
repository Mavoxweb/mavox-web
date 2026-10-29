import { getPublishedPostBySlug } from "@/lib/blog-repository";
import {
  contentToHtml,
  injectCtas,
  autoExcerpt,
  readingTimeMinutes,
  formatZonedDateTime,
} from "@/lib/blog-content";
import { SITE } from "@/lib/site";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return {
      title: "Artigo Não Encontrado | Mavox",
    };
  }

  const title = post.seo_title || post.title;
  const description = post.meta_description || autoExcerpt(contentToHtml(post.content) || "", 160) || "Leia este artigo no blog da Mavox.";
  const cover = post.cover_image
    ? post.cover_image.startsWith("/")
      ? `${SITE.url}${post.cover_image}`
      : post.cover_image
    : `${SITE.url}/images/blog-share.png`;

  return {
    title: `${title} | Blog Mavox`,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `${SITE.url}/blog/${slug}`,
      publishedTime: post.published_at,
      authors: [SITE.name],
      images: [{ url: cover, width: 1200, height: 630, alt: title }],
      siteName: SITE.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [cover],
    },
    alternates: { canonical: `${SITE.url}/blog/${slug}` },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const htmlBody = injectCtas(contentToHtml(post.content || ""), post.cta_enabled ?? true);
  const minutes = post.content ? readingTimeMinutes(contentToHtml(post.content)) : 4;
  const coverUrl = post.cover_image
    ? post.cover_image.startsWith("/")
      ? `${SITE.url}${post.cover_image}`
      : post.cover_image
    : null;
  const timeZone = post.scheduled_timezone || "America/Sao_Paulo";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.seo_title || post.title,
    description: post.meta_description || autoExcerpt(contentToHtml(post.content || ""), 160) || "",
    image: coverUrl || `${SITE.url}/images/blog-share.png`,
    url: `${SITE.url}/blog/${slug}`,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: `${SITE.url}/logo.png` } },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE.url}/blog/${slug}` },
    articleSection: "Marketing Digital",
    inLanguage: "pt-BR",
  };

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#fafafc] dark:bg-[#0f172a]">
        {/* Article Header */}
        <header className="bg-white dark:bg-[#1e293b] border-b border-[#e2e8f0] dark:border-[#334155] pt-12 pb-10 px-6 sm:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <nav className="mb-6">
              <Link
                href="/blog"
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                ← Voltar para todos os artigos
              </Link>
            </nav>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              {post.ai_generated && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                  IA Assistido
                </span>
              )}
              <span className="text-xs text-[#64748b] dark:text-[#94a3b8] font-medium">
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
                {post.published_at && ` · ${minutes} min de leitura`}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] dark:text-[#f1f5f9] leading-tight mb-4">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-lg sm:text-xl text-[#475569] dark:text-[#94a3b8] leading-relaxed max-w-3xl">
                {post.excerpt}
              </p>
            )}
          </div>
        </header>

        {/* Cover image */}
        {coverUrl && (
          <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 -mt-6 relative z-10">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-[#e2e8f0] dark:border-[#334155]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverUrl}
                alt={post.title}
                className="w-full aspect-[21/9] object-cover"
                loading="eager"
              />
            </div>
          </div>
        )}

        {/* Article Body */}
        <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-14">
          <article className="bg-white dark:bg-[#1e293b] p-8 sm:p-12 rounded-2xl border border-[#e2e8f0] dark:border-[#334155] shadow-sm">
            {post.content ? (
              <div
                className="blog-body text-[#334155] dark:text-[#cbd5e1] leading-relaxed text-base sm:text-lg"
                dangerouslySetInnerHTML={{ __html: htmlBody }}
              />
            ) : (
              <div className="text-[#475569] dark:text-[#94a3b8] leading-relaxed space-y-6">
                <p>
                  No mercado digital altamente competitivo de hoje, empresas que estruturam sua presença na web com estratégia, clareza na proposta de valor e campanhas de conversão alcançam resultados consideravelmente superiores.
                </p>
                <h2>Como transformar visitantes em clientes reais</h2>
                <p>
                  Ter apenas um site bonito não é suficiente. Um projeto eficiente precisa combinar design responsivo e veloz, redação persuasiva (copywriting), e integrações diretas com canais de atendimento rápido, como o WhatsApp.
                </p>
              </div>
            )}

            {/* End CTA (já injetado automaticamente pelo injectCtas) */}
          </article>
        </main>

        {/* Footer article meta */}
        <footer className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 pb-16">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900/30 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-extrabold text-[#0f172a] dark:text-[#f1f5f9] mb-2">
              Pronto para sair do papel?
            </h3>
            <p className="text-sm text-[#475569] dark:text-[#94a3b8] mb-5 max-w-xl mx-auto">
              A Mavox cria sites, landing pages e campanhas focadas em gerar orçamentos reais para o seu negócio.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/orcamento"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/20"
              >
                Solicite Orçamento Grátis
              </Link>
              <a
                href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Olá! Vi o artigo no blog da Mavox e quero falar sobre um projeto.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
              >
                Fale no WhatsApp
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
