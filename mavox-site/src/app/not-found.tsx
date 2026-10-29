import Link from "next/link";

export default function NotFound() {
  return (
    <main className="surface-dark flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center">
      <span className="font-display text-8xl font-extrabold text-accent">404</span>
      <h1 className="mt-4 font-display text-2xl font-bold text-white sm:text-3xl">Página não encontrada</h1>
      <p className="mt-3 max-w-md text-white/70">A URL que você tentou acessar não existe ou foi movida. Volte ao início e explore o que a Mavox pode fazer pelo seu negócio.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">Voltar ao início</Link>
        <Link href="/orcamento" className="btn btn-ghost">Pedir orçamento</Link>
      </div>
    </main>
  );
}