import { posts } from "@/app/blog/mock-posts";
import Link from "next/link";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0f172a] dark:text-[#f1f5f9]">Artigo não encontrado</h1>
          <Link href="/blog" className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline">Voltar ao blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a]">
      <header className="bg-white dark:bg-[#1e293b] border-b border-[#e2e8f0] dark:border-[#334155] py-8 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <nav className="mb-6">
            <Link href="/blog" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              ← Voltar ao blog
            </Link>
          </nav>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {post.status}
            </span>
            {post.ai_generated && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                IA
              </span>
            )}
            <span className="text-xs text-[#64748b] dark:text-[#94a3b8]">
              {new Date(post.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#0f172a] dark:text-[#f1f5f9] mb-4 line-clamp-2">{post.title}</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <article className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-lg text-[#64748b] dark:text-[#cbd5e1] mb-6">
            {post.excerpt}
          </p>
          <div className="space-y-8">
            <p className="text-[#475569] dark:text-[#cbd5e1] leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p className="text-[#475569] dark:text-[#cbd5e1] leading-relaxed">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <h2 className="text-2xl font-bold text-[#0f172a] dark:text-[#f1f5f9] mt-8 mb-4">Por que escolher a Mavox?</h2>
            <p className="text-[#475569] dark:text-[#cbd5e1] leading-relaxed mb-4">
              Na Mavox, somos especialistas em desenvolvimento web e marketing digital. Nossa equipe está preparada para ajudar seu negócio a crescer na internet.
            </p>
            <ul className="list-disc pl-6 text-[#475569] dark:text-[#cbd5e1] leading-relaxed mb-6">
              <li>Sites institucionais profissionais</li>
              <li>Landing pages focadas em conversão</li>
              <li>Lojas virtuais completas</li>
              <li>Gestão de tráfego pago (Google Ads e Meta Ads)</li>
              <li>Criação de marca e identidade visual</li>
            </ul>
            <p className="text-[#475569] dark:text-[#cbd5e1] leading-relaxed">
              Quer levar seu negócio para o próximo nível? Entre em contato conosco e descubra como podemos ajudar.
            </p>
          </div>
        </article>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="bg-blue-50 dark:bg-[#1e293b] rounded-xl p-6 border border-blue-100 dark:border-blue-900/30">
          <h2 className="text-xl font-bold text-[#0f172a] dark:text-[#f1f5f9] mb-4">Quer impulsionar seu negócio?</h2>
          <p className="text-[#64748b] dark:text-[#94a3b8] mb-6">
            Fale com nossos especialistas e descubra como a Mavox pode ajudar seu negócio a crescer online.
          </p>
          <a href="/orcamento" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Solicitar Orçamento
          </a>
        </div>
      </div>
    </div>
  );
}
