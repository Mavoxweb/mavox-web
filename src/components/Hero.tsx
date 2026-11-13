import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { claimCopy } from "@/data/claims";
import { HeroShowcase } from "./HeroShowcase";

const assurances = ["Sem compromisso", claimCopy.heroAssurance, "Você é dono do site"];

export function Hero() {
  return (
    <section id="hero" className="surface-dark relative isolate">
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-accent/12 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[30rem] w-[30rem] rounded-full bg-surface-2/60 blur-3xl" />
      </div>
      <div className="container-x grid items-center gap-12 pb-16 pt-12 lg:min-h-[calc(100svh-72px)] lg:grid-cols-[1.1fr_.9fr] lg:gap-16 lg:py-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-3.5 py-1.5 text-sm font-medium text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden /> Agência de desenvolvimento e marketing digital
          </p>
          <h1 className="t-h1 mt-6 text-white">
            Seu site deveria trazer clientes. <span className="text-accent">O nosso traz.</span>
          </h1>
          <p className="t-lead mt-6 max-w-xl">{claimCopy.heroLead}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-nowrap">
            <a href="#contato" className="btn btn-primary whitespace-nowrap">Quero minha proposta <ArrowRight className="h-5 w-5" aria-hidden /></a>
            <Link href="/#servicos" className="btn btn-ghost whitespace-nowrap">Ver serviços</Link>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white">
            {assurances.map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-accent" aria-hidden />{t}</li>
            ))}
          </ul>
        </div>
        <HeroShowcase />
      </div>
    </section>
  );
}


