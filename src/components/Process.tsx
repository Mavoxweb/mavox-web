import { Clock, KeyRound, Layers, Headset, type LucideIcon } from "lucide-react";
import { process, guarantees } from "@/data/content";

const gIcons: Record<string, LucideIcon> = { clock: Clock, key: KeyRound, layers: Layers, headset: Headset };

export function Process() {
  return (
    <section id="processo" aria-labelledby="processo-title" className="surface-light section-y">
      <div className="container-x">
        <h2 id="processo-title" className="t-h2 max-w-3xl">Simples, transparente e sem risco para você</h2>
        <p className="t-lead mt-4 max-w-2xl">Quatro passos, com você aprovando cada um antes de avançarmos.</p>

        <ol className="relative mt-14 grid gap-10 md:grid-cols-4 md:gap-6">
          <span aria-hidden className="absolute left-[1.35rem] top-2 bottom-2 w-px bg-paper-line md:left-6 md:right-6 md:top-[1.35rem] md:bottom-auto md:h-px md:w-auto" />
          {process.map((p, i) => (
            <li key={p.title} className="relative pl-16 md:pl-0 md:pt-16">
              <span aria-hidden className="absolute left-0 top-0 grid h-11 w-11 place-items-center rounded-full border border-paper-line bg-white font-display text-sm font-bold text-surface md:left-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="sr-only">Passo {i + 1}: </span>
              <h3 className="t-h3">{p.title}</h3>
              <p className="mt-2 text-[15px]">{p.text}</p>
            </li>
          ))}
        </ol>

        <div className="surface-navy mt-16 rounded-[var(--radius-block)] p-6 sm:p-10">
          <h3 className="t-h3 !text-xl">Nossas garantias</h3>
          <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
            {guarantees.map((g) => {
              const Icon = gIcons[g.icon];
              return (
                <li key={g.title}>
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-accent"><Icon className="h-5 w-5" aria-hidden /></span>
                  <p className="mt-3 font-display font-bold text-white">{g.title}</p>
                  <p className="mt-1 text-sm">{g.text}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
