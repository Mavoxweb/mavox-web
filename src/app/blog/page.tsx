import { posts } from "@/app/blog/mock-posts";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a]">
      <header className="bg-white dark:bg-[#1e293b] border-b border-[#e2e8f0] dark:border-[#334155] py-12 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-[#0f172a] dark:text-[#f1f5f9] mb-4">Blog Mavox</h1>
          <p className="text-lg text-[#64748b] dark:text-[#94a3b8]">
            Artigos sobre desenvolvimento web, marketing digital, tráfego pago e muito mais.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article key={post.id} className="bg-white dark:bg-[#1e293b] rounded-xl border border-[#e2e8f0] dark:border-[#334155] overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="h-48 bg-[#f1f5f9] dark:bg-[#334155]">
                <img
                  src={`https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80`}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {post.status}
                  </span>
                  <span className="text-xs text-[#64748b] dark:text-[#94a3b8]">
                    {new Date(post.published_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#0f172a] dark:text-[#f1f5f9] mb-2 line-clamp-2">{post.title}</h2>
                <p className="text-[#64748b] dark:text-[#94a3b8] text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                <a
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                >
                  Ler artigo <span className="text-xs">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
