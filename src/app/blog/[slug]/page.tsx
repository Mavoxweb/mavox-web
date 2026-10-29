import { getPublishedPostBySlug } from "@/lib/blog-repository";
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

  return {
    title: `${post.title} | Blog Mavox`,
    description: post.excerpt || "Leia este artigo no blog da Mavox sobre tecnologia e vendas.",
    openGraph: {
      title: post.title,
      description: post.excerpt || "",
      type: "article",
      publishedTime: post.published_at,
    },
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

  return (
    <div className="min-h-screen bg-[#fafafc] dark:bg-[#0f172a]">
      {/* Article Header */}
      <header className="bg-white dark:bg-[#1e293b] border-b border-[#e2e8f0] dark:border-[#334155] py-12 px-6 sm:px-8 lg:px-12">
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
              Publicado em{" "}
              {new Date(post.published_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0f172a] dark:text-[#f1f5f9] leading-tight mb-4">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg text-[#64748b] dark:text-[#94a3b8] leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </div>
      </header>

      {/* Article Body */}
      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <article className="bg-white dark:bg-[#1e293b] p-8 sm:p-12 rounded-2xl border border-[#e2e8f0] dark:border-[#334155] shadow-sm">
          {post.content ? (
            <div className="space-y-6 text-[#334155] dark:text-[#cbd5e1] leading-relaxed whitespace-pre-line text-base sm:text-lg">
              {post.content}
            </div>
          ) : (
            <div className="space-y-6 text-[#334155] dark:text-[#cbd5e1] leading-relaxed text-base sm:text-lg">
              <p>
                No mercado digital altamente competitivo de hoje, empresas que estruturam sua presença na web com estratégia, clareza na proposta de valor e campanhas de conversão alcançam resultados consideravelmente superiores.
              </p>
              <h2 className="text-2xl font-bold text-[#0f172a] dark:text-[#f1f5f9] mt-8 mb-4">
                Como transformar visitantes em clientes reais
              </h2>
              <p>
                Ter apenas um site bonito não é suficiente. Um projeto eficiente precisa combinar design responsivo e veloz, redação persuasiva (copywriting), e integrações diretas com canais de atendimento rápido, como o WhatsApp.
              </p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>Velocidade e performance no carregamento da página.</li>
                <li>Design adaptado para dispositivos móveis com foco em usabilidade.</li>
                <li>Rastreamento de conversão com Meta Pixel e Google Analytics.</li>
                <li>Chamadas para ação (CTAs) estratégicas em pontos-chave.</li>
              </ul>
              <p>
                Seja criando uma nova landing page ou desenvolvendo uma plataforma corporativa completa, o alinhamento entre tráfego e experiência do usuário é a chave do ROI.
              </p>
            </div>
          )}

          {/* CTA Box inside post */}
          <div className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-xl border border-blue-200 dark:border-blue-900/50">
            <h3 className="text-xl font-bold text-[#0f172a] dark:text-[#f1f5f9] mb-2">
              Pronto para alavancar os resultados da sua empresa?
            </h3>
            <p className="text-sm text-[#475569] dark:text-[#94a3b8] mb-6">
              A equipe da Mavox desenvolve sites profissionais e campanhas focadas em gerar orçamentos reais para o seu negócio.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/orcamento"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md"
              >
                Solicitar Orçamento Grátis
              </Link>
              <a
                href="https://wa.me/5521992855872?text=Ol%C3%A1%2C%20li%20o%20artigo%20no%20blog%20e%20gostaria%20de%20saber%20mais%20sobre%20os%20servi%C3%A7os"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
