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
        <Image src={shot.src} alt={shot.alt} fill sizes="(min-width: 1024px) 28rem, 86vw" className="object-cover object-top" />
      </div>
    </div>
  );
}

function PhoneShot({ shot }: { shot: CaseShot }) {
  return (
    <div data-device="phone" className="h-full rounded-[1.15rem] bg-[#1A1548] p-1 shadow-float">
      <div className="relative h-full overflow-hidden rounded-[0.9rem] bg-white">
        <Image src={shot.src} alt={shot.alt} fill sizes="(min-width: 1024px) 9rem, 28vw" className="object-cover object-top" />
      </div>
    </div>
  );
}

export function PortfolioCases() {
  return (
    <section aria-labelledby="portfolio-title" className="surface-paper section-y">
      <div className="container-x">
        <h2 id="portfolio-title">Projetos que a Mavox <span className="hl">entregou</span></h2>
        <ul className="mt-10 grid gap-8 lg:grid-cols-2">
          {portfolioCases.map((item) => {
            const phoneOnly = !item.desktop && item.mobile;
            const smallerPhone = item.title === "Geriatex" || item.title === "Poupconsig";
            const copy = (
              <div className={phoneOnly ? "flex flex-1 flex-col justify-center" : undefined}>
                <p className="text-xs font-bold uppercase tracking-widest text-[#0085C6]">{item.tag}</p>
                <h3 className="t-h3 mt-1">{item.title}</h3>
                <p className="mt-2 text-base">{item.summary}</p>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark mt-4 self-start">
                  {item.linkLabel}
                  <span className="sr-only"> de {item.title}. Abre em uma nova aba.</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
              </div>
            );
            return (
              <li key={item.url} className={phoneOnly ? "lg:col-span-2" : undefined}>
                <article className={`overflow-hidden rounded-[var(--radius-card)] border border-paper-line bg-white p-4 shadow-card ${phoneOnly ? "flex flex-col gap-6 sm:flex-row sm:items-center" : "flex h-full flex-col"}`}>
                  {item.desktop ? (
                    <div className="relative">
                      <Browser shot={item.desktop} host={hostOf(item.url)} />
                      {item.mobile ? (
                        <div className={`absolute bottom-3 right-3 ${smallerPhone ? "h-[58%] w-[26%] max-w-[7.2rem]" : "h-[68%] w-[30%] max-w-[8.5rem]"}`}>
                          <PhoneShot shot={item.mobile} />
                        </div>
                      ) : null}
                    </div>
                  ) : item.mobile ? (
                    <div className="mx-auto w-[11.5rem] shrink-0 sm:mx-0" style={{ aspectRatio: `${item.mobile.width} / ${item.mobile.height}` }}>
                      <PhoneShot shot={item.mobile} />
                    </div>
                  ) : null}
                  {phoneOnly ? copy : <div className="mt-4">{copy}</div>}
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
