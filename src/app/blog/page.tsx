import { getPublishedPosts } from "@/lib/blog-repository";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Mavox - Marketing Digital e Desenvolvimento Web",
  description: "Artigos práticos sobre desenvolvimento de sites de alta conversão, e-commerce, tráfego pago e automação de vendas para empresas.",
};

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
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white dark:bg-[#1e293b] rounded-2xl border border-[#e2e8f0] dark:border-[#334155] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1"
              >
                <div className="h-48 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80"
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {post.ai_generated && (
                    <span className="absolute top-3 right-3 text-[10px] font-semibold bg-purple-600 text-white px-2 py-0.5 rounded-full shadow">
                      IA Assistido
                    </span>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-[#64748b] dark:text-[#94a3b8] font-medium">
                        {new Date(post.published_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-[#0f172a] dark:text-[#f1f5f9] mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>

                    <p className="text-[#64748b] dark:text-[#94a3b8] text-sm line-clamp-3 mb-5 leading-relaxed">
                      {post.excerpt}
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
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
