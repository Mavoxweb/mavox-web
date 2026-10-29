import Link from "next/link";
import { Globe, Target, ShoppingCart, Code2, BarChart3, ShieldCheck, Palette, Megaphone, Check, Clock, ArrowRight, type LucideIcon } from "lucide-react";
import { services, type Service } from "@/data/services";
import { Disclosure } from "./Disclosure";
import { WhatsAppLink } from "./WhatsAppLink";

const icons: Record<Service["icon"], LucideIcon> = { globe: Globe, target: Target, cart: ShoppingCart, code: Code2, chart: BarChart3, megaphone: Megaphone, palette: Palette, shield: ShieldCheck };

function ServiceCard({ s }: { s: Service }) {
  const Icon = icons[s.icon];
  const f = !!s.featured;
  const visible = s.includes.slice(0, 3);
  const rest = s.includes.slice(3);
  return (
    <article
      className={`relative flex flex-col rounded-[var(--radius-card)] p-6 sm:p-7 ${
        f ? "surface-paper shadow-float ring-2 ring-accent lg:rounded-[var(--radius-block)] lg:p-10"
          : "border border-line bg-surface"
      }`}
    >
      {s.badge && <span className="absolute -top-3 left-6 rounded-full bg-accent px-3.5 py-1 text-xs font-bold text-bg">{s.badge}</span>}
      <span className={`grid h-12 w-12 place-items-center rounded-xl ${f ? "bg-accent/15 text-accent-ink" : "bg-accent/15 text-accent"}`}><Icon className="h-6 w-6" aria-hidden /></span>
      <h3 className={`mt-5 ${f ? "t-h2 !text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)]" : "t-h3"}`}>{s.name}</h3>
      <p className={`mt-2 ${f ? "t-lead text-paper-ink" : "text-white/90"}`}>{s.promise}</p>

      <ul className="mt-5 space-y-2.5 text-[15px]">
        {visible.map((x) => (
          <li key={x} className="flex gap-2.5"><Check className={`mt-0.5 h-4 w-4 shrink-0 ${f ? "text-accent-ink" : "text-accent"}`} aria-hidden />{x}</li>
        ))}
      </ul>
      <Disclosure label="Ver detalhes" className="mt-1">
        <ul className="space-y-2.5 pt-2 text-[15px]">
          {rest.map((x) => <li key={x} className="flex gap-2.5"><Check className={`mt-0.5 h-4 w-4 shrink-0 ${f ? "text-accent-ink" : "text-accent"}`} aria-hidden />{x}</li>)}
          <li className="pt-1"><strong className={f ? "text-paper-ink" : "text-white"}>Ideal para:</strong> {s.forWho}</li>
        </ul>
      </Disclosure>

      <div className={`mt-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-1 border-t border-dashed pt-5 ${f ? "border-paper-line" : "border-line"}`}>
        {s.priceFrom && (
          <p className="leading-tight"><span className="block text-xs">A partir de</span><span className={`font-display text-2xl font-extrabold tabular ${f ? "text-paper-ink" : "text-white"}`}>{s.priceFrom}</span></p>
        )}
        <p className="inline-flex items-center gap-1.5 text-sm font-medium"><Clock className="h-4 w-4" aria-hidden />{s.deadline}</p>
      </div>

      <Link href={`/orcamento?servico=${s.slug}`} className={`btn btn-block mt-5 ${f ? "btn-primary" : "btn-ghost"}`}>
        Quero este serviço <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
      <WhatsAppLink message={`Olá! Tenho interesse em: ${s.name}. Podem me ajudar?`} className="mt-1 inline-flex min-h-11 items-center justify-center text-sm font-medium underline-offset-4 [@media(hover:hover)]:hover:underline">
        ou tirar dúvidas no WhatsApp
      </WhatsAppLink>
    </article>
  );
}

export function Services() {
  return (
    <section id="servicos" aria-labelledby="servicos-title" className="surface-dark section-y">
      <div className="container-x">
        <h2 id="servicos-title" className="t-h2 max-w-3xl">Escolha por onde começar. Nós cuidamos do resto.</h2>
        <p className="t-lead mt-4 max-w-2xl">Cada serviço resolve um problema real do seu negócio. Combine o que precisa e receba uma proposta sob medida, sem pagar pelo que não vai usar.</p>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-2">
          {services.map((s) => <ServiceCard key={s.slug} s={s} />)}
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-[var(--radius-block)] border border-accent/40 bg-accent/10 p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <h3 className="t-h3">Precisa de mais de um serviço? Monte seu pacote.</h3>
            <p className="mt-1">Quem combina site e tráfego, ou loja e suporte, recebe uma proposta integrada e mais eficiente.</p>
          </div>
          <Link href="/orcamento" className="btn btn-primary shrink-0 max-sm:w-full">Montar meu orçamento</Link>
        </div>
      </div>
    </section>
  );
}

