import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { QuoteForm } from "@/components/QuoteForm";
import { Check } from "lucide-react";
import { claimCopy } from "@/data/claims";

export const metadata: Metadata = {
  title: "Pedir orçamento grátis",
  description: claimCopy.orcamentoDescription,
};

export default async function Page({ searchParams }: { searchParams: Promise<{ servico?: string }> }) {
  const { servico } = await searchParams;
  return (
    <>
      <Header />
      <main id="main" className="surface-paper section-y">
        <div className="container-x max-w-3xl">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold text-accent-ink">Orçamento sem compromisso</p>
            <h1 className="t-h2 mt-3">{claimCopy.orcamentoTitle}</h1>
            <p className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm">
              {["100% gratuito", "Escopo e prazo claros", "Sem compromisso"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-accent-ink" aria-hidden />{t}</span>
              ))}
            </p>
          </div>
          <QuoteForm initialService={servico} />
        </div>
      </main>
      <Footer />
    </>
  );
}

