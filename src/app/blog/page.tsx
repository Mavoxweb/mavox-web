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

// Revalida a listagem a cada 60s para refletir posts agendados que venceram,
// sem depender de cron a cada 5 minutos (indisponível no plano Hobby).
export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="min-h-screen bg-[#fafafc] dark:bg-[#0f172a]">
      {/* Header */}
      <header className="bg-white dark:bg-[#1e293b] border-b border-[#e2e8f0] dark:border-[#334155] py-16 px-6 sm:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-full">
            Artigos & Estratégias
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0f172a] dark:text-[#f1f5f9] mt-4 mb-4 tracking-tight">
            Blog Mavox
          </h1>
          <p className="text-base sm:text-lg text-[#64748b] dark:text-[#94a3b8] max-w-2xl mx-auto">
            Conteúdo estratégico sobre desenvolvimento de sites, Google Ads, Meta Ads e vendas para pequenas e médias empresas.
          </p>
        </div>
      </header>

      {/* Grid de Posts */}
      <main className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-14">
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
            <p className="text-gray-500">Nenhum artigo publicado no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  className="bg-white dark:bg-[#1e293b] rounded-2xl border border-[#e2e8f0] dark:border-[#334155] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block h-48 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 relative overflow-hidden"
                  >
                    {post.cover_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80"
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    )}
                    {post.ai_generated && (
                      <span className="absolute top-3 right-3 text-[10px] font-semibold bg-purple-600 text-white px-2 py-0.5 rounded-full shadow">
                        IA Assistido
                      </span>
                    )}
                  </Link>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3 text-xs text-[#64748b] dark:text-[#94a3b8] font-medium">
                        <time dateTime={post.published_at}>
                          {new Date(post.published_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </time>
                        <span aria-hidden>·</span>
                        <span>{minutes} min de leitura</span>
                      </div>

                      <h2 className="text-lg font-bold text-[#0f172a] dark:text-[#f1f5f9] mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h2>

                      <p className="text-[#64748b] dark:text-[#94a3b8] text-sm line-clamp-3 mb-5 leading-relaxed">
                        {summary}
                      </p>
                    </div>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 pt-3 border-t border-gray-100 dark:border-gray-800 transition-colors"
                    >
                      Ler artigo completo
                      <span className="text-base transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Resumo textual para SEO da listagem */}
        <div className="mt-14 bg-white dark:bg-[#1e293b] rounded-2xl border border-[#e2e8f0] dark:border-[#334155] p-6 sm:p-8">
          <h2 className="text-xl font-bold text-[#0f172a] dark:text-[#f1f5f9] mb-3">
            Conteúdo que gera orçamento, não só visitas
          </h2>
          <p className="text-[#475569] dark:text-[#cbd5e1] leading-relaxed">
            {stripHtml(
              "Aqui você encontra guias sobre criação de sites profissionais, lojas virtuais, landing pages de alta conversão, Google Ads, Meta Ads e automação comercial. Cada artigo é escrito para responder dúvidas reais de quem precisa vender mais na internet — e termina com um caminho direto para falar com a equipe da Mavox."
            )}
          </p>
        </div>
      </main>
    </div>
  );
}
