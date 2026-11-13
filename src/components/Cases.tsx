import { cases } from "@/data/cases";
import { metrics } from "@/data/clients";
import { CaseArticle } from "./CaseArticle";
import { CasesScroller } from "./CasesScroller";

const projetos = metrics.find((m) => m.label === "projetos");

export function Cases() {
  return (
    <section id="cases" aria-labelledby="cases-title" className="surface-light section-y">
      <div className="container-x">
        <h2 id="cases-title" className="t-h2">Projetos que a Mavox entregou</h2>
        <p className="t-lead mt-4 max-w-2xl text-paper-ink">
          {projetos ? `${projetos.prefix ?? ""}${projetos.value} projetos entregues. Alguns deles:` : "Alguns deles:"}
        </p>
        <span className="mt-4 block h-1 w-16 rounded-full" style={{ background: "var(--gradient-green)" }} aria-hidden />
        <div className="mt-10">
          <CasesScroller items={cases} />
          <div className="mt-12 hidden flex-col gap-16 lg:flex" data-testid="cases-list">
            {cases.map((item) => (
              <CaseArticle key={item.title} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
