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

      <div className="post-page min-h-screen">
        {/* Article Header */}
        <header className="sticky top-0 z-30 backdrop-blur-xl border-b" style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px) saturate(180%)" }} />
        <header className="relative px-6 sm:px-8 lg:px-12 pt-16 pb-12">
          <div className="max-w-4xl mx-auto">
            <nav className="mb-8" aria-label="Breadcrumb">
              <Link href="/blog" className="back-link">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar para todos os artigos
              </Link>
            </nav>

            <div className="flex flex-wrap items-center gap-2 mb-5">
              {post.ai_generated && (
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide"
                  style={{ background: "rgba(139,92,246,0.15)", color: "rgb(167,139,250)" }}>
                  IA Assistido
                </span>
              )}
              <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
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

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.05] mb-5"
              style={{ color: "var(--text)", letterSpacing: "-0.02em" }}>
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-lg sm:text-xl max-w-3xl leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
                {post.excerpt}
              </p>
            )}
          </div>
        </header>

        {/* Cover Image */}
        {coverUrl && (
          <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 -mt-8 relative z-10">
            <div className="rounded-2xl overflow-hidden shadow-2xl border" style={{ borderColor: "var(--border)" }}>
              <img
                src={coverUrl}
                alt={post.title}
                className="cover-image w-full aspect-[21/9] object-cover transition-transform duration-700 ease-out"
                loading="eager"
                style={{ transform: "scale(1)" }}
              />
            </div>
          </div>
        )}

        {/* Article Body */}
        <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-16 lg:py-20 pb-20">
          <article className="relative rounded-2xl shadow-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="p-8 sm:p-12 lg:p-16 blog-body" style={{ color: "var(--text)" }}>
              {post.content ? (
                <div dangerouslySetInnerHTML={{ __html: htmlBody }} />
              ) : (
                <div className="space-y-6 leading-relaxed">
                  <p>
                    No mercado digital altamente competitivo de hoje, empresas que estruturam sua presença na web com estratégia, clareza na proposta de valor e campanhas de conversão alcançam resultados consideravelmente superiores.
                  </p>
                  <h2>Como transformar visitantes em clientes reais</h2>
                  <p>
                    Ter apenas um site bonito não é suficiente. Um projeto eficiente precisa combinar design responsivo e veloz, redação persuasiva (copywriting), e integrações diretas com canais de atendimento rápido, como o WhatsApp.
                  </p>
                </div>
              )}

              {/* Footer CTA inside article */}
              <div className="mt-12 pt-8 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border rounded-2xl p-8 text-center" style={{ borderColor: "rgba(37,99,235,0.2)" }}>
                  <h3 className="text-2xl font-extrabold mb-2" style={{ color: "var(--text)" }}>
                    Pronto para sair do papel?
                  </h3>
                  <p className="text-sm mb-6 max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
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
              </div>
            </div>
          </article>
        </main>
      </div>
    </>
  );
}