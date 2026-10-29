import { cases } from "@/data/cases";

export function Cases() {
  return (
    <section id="cases" aria-labelledby="cases-title" className="surface-paper section-y">
      <div className="container-x">
        <h2 id="cases-title" className="t-h2">Sites que entregamos</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <article key={c.title} className="group overflow-hidden rounded-[var(--radius-card)] border border-paper-line bg-white shadow-card">
              <div className="aspect-video bg-paper-muted/20">
                 {/* TODO(substituir por prints reais) */}
              </div>
              <div className="p-5">
                <span className="text-xs font-bold uppercase tracking-widest text-accent-ink">{c.tag}</span>
                <h3 className="mt-2 font-display font-bold text-paper-ink">{c.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
