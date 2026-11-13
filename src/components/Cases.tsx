import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cases, type CaseShot } from "@/data/cases";
import { CasesScroller } from "./CasesScroller";

function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function Shot({
  shot,
  sizes,
}: {
  shot: CaseShot;
  sizes: string;
}) {
  return (
    <div className="relative bg-paper" style={{ aspectRatio: `${shot.width} / ${shot.height}` }}>
      <Image
        src={shot.src}
        alt={shot.alt}
        fill
        sizes={sizes}
        className="object-cover object-top"
      />
    </div>
  );
}

function BrowserFrame({ shot, host, sizes }: { shot: CaseShot; host: string; sizes: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-paper-line bg-white shadow-card">
      <div className="h-1" style={{ background: "var(--gradient-green)" }} aria-hidden />
      <div className="flex h-9 items-center gap-2 border-b border-paper-line bg-paper px-3" aria-hidden>
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#e5484d]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#f5c451]" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        </span>
        <span className="mx-auto max-w-[68%] truncate rounded-md bg-white px-3 py-0.5 text-[11px] leading-5 text-paper-muted ring-1 ring-paper-line">
          {host}
        </span>
      </div>
      <Shot shot={shot} sizes={sizes} />
    </div>
  );
}

function PhoneFrame({ shot, sizes }: { shot: CaseShot; sizes: string }) {
  return (
    <div className="rounded-[1.7rem] bg-bg p-1.5 shadow-float ring-1 ring-white/15">
      <div className="overflow-hidden rounded-[1.25rem] bg-white">
        <div className="flex justify-center bg-bg py-1.5" aria-hidden>
          <span className="h-1.5 w-10 rounded-full bg-white/30" />
        </div>
        <Shot shot={shot} sizes={sizes} />
      </div>
    </div>
  );
}

function DeviceStage({
  desktop,
  mobile,
  host,
}: {
  desktop?: CaseShot;
  mobile?: CaseShot;
  host: string;
}) {
  if (desktop && mobile) {
    return (
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_6.5rem] items-end gap-3 sm:grid-cols-[minmax(0,1fr)_8.5rem] sm:gap-4 lg:grid-cols-[minmax(0,1fr)_27%] lg:gap-5">
        <BrowserFrame shot={desktop} host={host} sizes="(min-width: 1024px) 38rem, 68vw" />
        <PhoneFrame shot={mobile} sizes="(min-width: 1024px) 12rem, 30vw" />
      </div>
    );
  }
  if (desktop) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <BrowserFrame shot={desktop} host={host} sizes="(min-width: 1024px) 48rem, 92vw" />
      </div>
    );
  }
  if (mobile) {
    return (
      <div className="mx-auto w-full max-w-[15.5rem]">
        <PhoneFrame shot={mobile} sizes="248px" />
      </div>
    );
  }
  return null;
}

export function Cases() {
  return (
    <section id="cases" aria-labelledby="cases-title" className="surface-paper section-y">
      <div className="container-x">
        <h2 id="cases-title" className="t-h2">Sites que entregamos</h2>
        <span className="mt-4 block h-1 w-16 rounded-full" style={{ background: "var(--gradient-green)" }} aria-hidden />
        <CasesScroller labels={cases.map((item) => item.title)}>
          {cases.map((item) => (
            <li key={item.title} className="w-full min-w-0 shrink-0 snap-start lg:w-auto">
              <article className="grid min-w-0 items-center gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(16rem,.75fr)] lg:gap-14">
                <DeviceStage desktop={item.desktop} mobile={item.mobile} host={hostOf(item.url)} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-ink">{item.tag}</p>
                  <h3 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-paper-ink sm:text-3xl">{item.title}</h3>
                  <p className="mt-3 max-w-sm text-[15px] leading-relaxed">{item.summary}</p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-dark mt-6"
                  >
                    {item.linkLabel}
                    <span className="sr-only"> de {item.title}. Abre em uma nova aba.</span>
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </a>
                </div>
              </article>
            </li>
          ))}
        </CasesScroller>
      </div>
    </section>
  );
}
