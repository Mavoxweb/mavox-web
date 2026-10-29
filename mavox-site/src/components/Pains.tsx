import { MonitorOff, TrendingDown, UserX, Check, type LucideIcon } from "lucide-react";
import { pains } from "@/data/content";

const icons: Record<string, LucideIcon> = { monitor: MonitorOff, trend: TrendingDown, user: UserX };

export function Pains() {
  return (
    <section aria-labelledby="dores-title" className="surface-paper section-y">
      <div className="container-x">
        <h2 id="dores-title" className="t-h2 max-w-3xl">Reconhece alguma dessas situações?</h2>
        <p className="t-lead mt-4 max-w-2xl">Um site comum custa caro. Um site que não gera cliente custa ainda mais.</p>

        <div className="mt-12 grid overflow-hidden rounded-[var(--radius-block)] border border-paper-line bg-white shadow-card md:grid-cols-3 md:divide-x divide-y md:divide-y-0 divide-paper-line">
          {pains.map((p) => {
            const Icon = icons[p.icon];
            return (
              <article key={p.problem} className="flex flex-col p-7 sm:p-9">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-danger/10 text-danger"><Icon className="h-5 w-5" aria-hidden /></span>
                <h3 className="t-h3 mt-5">{p.problem}</h3>
                <p className="mt-2">{p.text}</p>
                <div className="mt-6 flex gap-3 rounded-xl bg-accent/10 p-4 md:mt-auto">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent-ink" aria-hidden />
                  <p className="font-medium text-paper-ink"><span className="sr-only">Solução: </span>{p.fix}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

