import { ArrowUpRight } from "lucide-react";
import type { PortfolioCase } from "@/data/cases";
import { BrowserFrame, PhoneFrame, hostOf } from "./DeviceFrames";

export function CaseArticle({
  item,
  eager = false,
}: {
  item: PortfolioCase;
  /** Carrega as imagens já, sem esperar o slide entrar na tela. */
  eager?: boolean;
}) {
  const host = hostOf(item.url);
  const phoneOnly = !item.desktop && !!item.mobile;

  return (
    <article className={`grid w-full min-w-0 items-center gap-6 ${phoneOnly ? "lg:grid-cols-[minmax(0,20rem)_1fr]" : "lg:grid-cols-[minmax(0,1.25fr)_minmax(16rem,.75fr)]"} lg:gap-14`}>
      {item.desktop && item.mobile ? (
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_6.5rem] items-end gap-4 sm:grid-cols-[minmax(0,1fr)_8.5rem] lg:grid-cols-[minmax(0,1fr)_27%]">
          <BrowserFrame shot={item.desktop} host={host} sizes="(min-width: 1024px) 38rem, 68vw" eager={eager} />
          <PhoneFrame shot={item.mobile} sizes="(min-width: 1024px) 12rem, 30vw" eager={eager} />
        </div>
      ) : null}
      {item.desktop && !item.mobile ? (
        <div className="w-full min-w-0">
          <BrowserFrame shot={item.desktop} host={host} sizes="(min-width: 1024px) 48rem, 92vw" eager={eager} />
        </div>
      ) : null}
      {phoneOnly && item.mobile ? (
        <div className="w-full min-w-0">
          <PhoneFrame shot={item.mobile} sizes="(min-width: 1024px) 20rem, calc(100vw - 2rem)" eager={eager} />
        </div>
      ) : null}
      <div className="min-w-0">
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
  );
}
