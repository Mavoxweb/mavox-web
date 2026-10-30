import { getPublishedPosts } from "@/lib/blog-repository";
import { autoExcerpt, contentToHtml, readingTimeMinutes, stripHtml } from "@/lib/blog-content";
import { SITE } from "@/lib/site";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Mavox - Marketing Digital e Desenvolvimento Web",
  description:
    "Artigos práticos sobre desenvolvimento de sites de alta conversão, e-commerce, tráfego pago e automação de vendas para empresas.",
  openGraph: {
    title: "Blog Mavox - Marketing Digital e Desenvolvimento Web",
    description:
      "Conteúdo estratégico sobre sites, e-commerce, tráfego pago e vendas para pequenas e médias empresas.",
    url: `${SITE.url}/blog`,
    type: "website",
    siteName: SITE.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog Mavox - Marketing Digital e Desenvolvimento Web",
    description:
      "Conteúdo estratégico sobre sites, e-commerce, tráfego pago e vendas para pequenas e médias empresas.",
  },
  alternates: { canonical: `${SITE.url}/blog` },
};

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="blog-page min-h-screen">
        {/* Translucent Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 border-b border-[var(--border)]" style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px) saturate(180%)" }}>
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-14 sm:py-20">
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider"
                style={{ background: "rgba(37,99,235,0.1)", color: "var(--accent)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} aria-hidden="true" />
                Artigos & Estratégias
              </span>
              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] mb-5"
                style={{ color: "var(--text)", letterSpacing: "-0.02em" }}>
                Blog Mavox
              </h1>
              <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Conteúdo estratégico sobre desenvolvimento de sites, Google Ads, Meta Ads e vendas para pequenas e médias empresas.
              </p>
            </div>
          </div>
        </header>

        {/* Posts Grid */}
        <main className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-14 sm:py-20">
          {posts.length === 0 ? (
            <div className="text-center py-24 sm:py-32">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
                style={{ background: "rgba(37,99,235,0.1)" }}>
                <svg className="w-10 h-10" style={{ color: "var(--accent)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2m-2 2h-10a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>Nenhum artigo publicado</h2>
              <p className="text-lg max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
                Volte em breve para conferir novos conteúdos sobre marketing digital e desenvolvimento web.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {posts.map((post) => {
                const summary =
                  post.excerpt ||
                  autoExcerpt(contentToHtml(post.content), 180) ||
                  "Leia este artigo no blog da Mavox.";
                const minutes = post.content
                  ? readingTimeMinutes(contentToHtml(post.content))
                  : 4;

                return (
                  <article
                    key={post.id}
                    className="post-card group relative overflow-hidden rounded-2xl flex flex-col"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)",
                    }}
                  >
                    <Link
                      href={`/blog/${post.slug}`}
                      className="block relative aspect-[16/10] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      style={{ "--focus-ring-color": "var(--accent)" } as React.CSSProperties}
                    >
                      {post.cover_image ? (
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="post-image w-full h-full object-cover transition-transform duration-500 ease-out"
                          loading="lazy"
                          style={{ transform: "scale(1)" }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                          <svg className="w-16 h-16" style={{ color: "rgba(37,99,235,0.3)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
                      {post.ai_generated && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide shadow-lg"
                          style={{ background: "rgba(139,92,246,0.9)", color: "white", backdropFilter: "blur(8px)" }}>
                          IA Assistido
                        </span>
                      )}
                    </Link>

                    <div className="p-5 sm:p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                        <time dateTime={post.published_at}>
                          {new Date(post.published_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </time>
                        <span aria-hidden="true" style={{ opacity: 0.5 }}>·</span>
                        <span>{minutes} min de leitura</span>
                      </div>

                      <h2 className="text-lg sm:text-xl font-bold leading-snug mb-3 line-clamp-2 group-hover:underline" style={{ color: "var(--text)" }}>
                        <Link href={`/blog/${post.slug}`} className="transition-colors duration-150" style={{ color: "inherit" }}>
                          {post.title}
                        </Link>
                      </h2>

                      <p className="text-sm leading-relaxed line-clamp-3 mb-5 flex-1" style={{ color: "var(--text-muted)" }}>
                        {summary}
                      </p>

                      <Link
                        href={`/blog/${post.slug}`}
                        className="read-link inline-flex items-center gap-1.5 text-sm font-semibold pt-4 border-t transition-colors duration-150"
                        style={{ borderColor: "var(--border)", color: "var(--accent)" }}
                      >
                        Ler artigo
                        <span className="text-base transition-transform duration-200 ease-out group-hover:translate-x-1" aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* CTA Section */}
          <section className="mt-16 sm:mt-24 relative overflow-hidden rounded-3xl cta-pattern" style={{ background: "linear-gradient(135deg, rgb(37,99,235) 0%, rgb(139,92,246) 100%)" }}>
            <div className="absolute inset-0 opacity-5" aria-hidden="true" />
            <div className="relative px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20 text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-4 text-white" style={{ letterSpacing: "-0.02em" }}>
                Conteúdo que gera orçamento, não só visitas
              </h2>
              <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-8 text-white/90 leading-relaxed">
                {stripHtml(
                  "Aqui você encontra guias sobre criação de sites profissionais, lojas virtuais, landing pages de alta conversão, Google Ads, Meta Ads e automação comercial. Cada artigo é escrito para responder dúvidas reais de quem precisa vender mais na internet — e termina com um caminho direto para falar com a equipe da Mavox."
                )}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/orcamento"
                  className="px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-0.5"
                  style={{ background: "white", color: "rgb(37,99,235)" }}
                >
                  Solicite Orçamento Grátis
                </Link>
                <a
                  href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Olá! Vi o artigo no blog da Mavox e quero falar sobre um projeto.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 border-2 border-white/30 hover:border-white/50 hover:bg-white/10 hover:-translate-y-0.5"
                  style={{ color: "white" }}
                >
                  Fale no WhatsApp
                </a>
              </div>
            </div>
          </section>
        </main>
    </div>
  );
}