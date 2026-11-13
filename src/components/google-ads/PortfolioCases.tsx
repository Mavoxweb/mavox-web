import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { portfolioCases, type CaseShot } from "@/data/portfolio-cases";

function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function Browser({ shot, host }: { shot: CaseShot; host: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-paper-line bg-white">
      <div className="flex h-8 items-center gap-2 border-b border-paper-line px-3" aria-hidden>
        <span className="h-2 w-2 rounded-full bg-[#1A1548]/30" />
        <span className="h-2 w-2 rounded-full bg-[#4CB748]" />
        <span className="h-2 w-2 rounded-full bg-[#0085C6]" />
        <span className="ml-2 truncate text-[11px] text-paper-muted">{host}</span>
      </div>
      <div className="relative aspect-video">
        <Image src={shot.src} alt={shot.alt} fill sizes="(min-width: 1024px) 22rem, 90vw" className="object-cover object-top" />
      </div>
    </div>
  );
}

function Phone({ shot }: { shot: CaseShot }) {
  return (
    <div className="mx-auto w-36 rounded-[1.4rem] bg-[#1A1548] p-1.5">
      <div className="overflow-hidden rounded-[1.1rem] bg-white">
        <div className="relative aspect-[9/16]">
          <Image src={shot.src} alt={shot.alt} fill sizes="144px" className="object-cover object-top" />
        </div>
      </div>
    </div>
  );
}

export function PortfolioCases() {
  return (
    <section aria-labelledby="portfolio-title" className="surface-paper section-y">
      <div className="container-x">
        <h2 id="portfolio-title" className="t-h2">Projetos que a Mavox entregou</h2>
        <ul className="mt-10 grid gap-8 lg:grid-cols-2">
          {portfolioCases.map((item) => (
            <li key={item.url}>
              <article className="flex h-full flex-col rounded-[var(--radius-card)] border border-paper-line bg-white p-4 shadow-card">
                {item.desktop ? (
                  <div className={item.mobile ? "grid grid-cols-[minmax(0,1fr)_5.5rem] items-end gap-3" : ""}>
                    <Browser shot={item.desktop} host={hostOf(item.url)} />
                    {item.mobile ? <Phone shot={item.mobile} /> : null}
                  </div>
                ) : item.mobile ? (
                  <Phone shot={item.mobile} />
                ) : null}
                <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#0085C6]">{item.tag}</p>
                <h3 className="t-h3 mt-1">{item.title}</h3>
                <p className="mt-2 text-base">{item.summary}</p>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark mt-4 self-start">
                  {item.linkLabel}
                  <span className="sr-only"> de {item.title}. Abre em uma nova aba.</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
