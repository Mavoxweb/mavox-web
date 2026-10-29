import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { HeroVisualLazy } from "./HeroVisualLazy";
import { MetricsPanel } from "./MetricsPanel";
import { metrics } from "@/data/clients";

const assurances = ["Sem compromisso", "Resposta em até 24h", "Você é dono do site"];

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
            Seu site deveria trazer clientes. <span className="font-semibold opacity-60">O nosso traz.</span>
          </h1>
          <p className="t-lead mt-6 max-w-xl">
            Sites, lojas e sistemas pensados para uma coisa só: gerar contatos e aumentar o faturamento da sua empresa. Sem enrolação e com proposta em até 24h.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#contato" className="btn btn-primary">Receber minha proposta grátis <ArrowRight className="h-5 w-5" aria-hidden /></a>
            <Link href="/#servicos" className="btn btn-ghost">Ver o cardápio de serviços</Link>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white">
            {assurances.map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-accent" aria-hidden />{t}</li>
            ))}
          </ul>
        </div>
        <HeroVisualLazy />
      </div>
      <MetricsPanel metrics={metrics} />
    </section>
  );
}


