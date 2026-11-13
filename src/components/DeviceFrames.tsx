import Image from "next/image";

import type { CaseShot } from "@/data/cases";

function Shot({
  shot,
  sizes,
  eager,
  priority,
}: {
  shot: CaseShot;
  sizes: string;
  eager?: boolean;
  priority?: boolean;
}) {
  return (
    <div className="relative bg-white" style={{ aspectRatio: `${shot.width} / ${shot.height}` }}>
      <Image
        src={shot.src}
        alt={shot.alt}
        fill
        sizes={sizes}
        className="object-cover object-top"
        {...(priority ? { priority: true } : { loading: eager ? "eager" as const : "lazy" as const })}
      />
    </div>
  );
}

export function BrowserFrame({
  shot,
  host,
  sizes,
  eager,
  priority,
}: {
  shot: CaseShot;
  host: string;
  sizes: string;
  eager?: boolean;
  priority?: boolean;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-paper-line bg-white shadow-card">
      <div className="h-1" style={{ background: "var(--gradient-green)" }} aria-hidden />
      <div className="flex h-9 items-center gap-2 border-b border-paper-line bg-paper px-3" aria-hidden>
        <span className="flex shrink-0 gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#e5484d]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#f5c451]" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        </span>
        <span className="mx-auto min-w-0 max-w-[68%] truncate rounded-md bg-white px-3 py-0.5 text-[11px] leading-5 text-paper-muted ring-1 ring-paper-line">
          {host}
        </span>
      </div>
      <Shot shot={shot} sizes={sizes} eager={eager} priority={priority} />
    </div>
  );
}

export function PhoneFrame({
  shot,
  sizes,
  eager,
  priority,
  maxScreenHeight,
}: {
  shot: CaseShot;
  sizes: string;
  eager?: boolean;
  priority?: boolean;
  /** Corta a tela e mostra o topo. A moldura fica em torno de 360px. */
  maxScreenHeight?: number;
}) {
  return (
    <div className="min-w-0 rounded-[1.7rem] bg-bg p-1.5 shadow-float ring-1 ring-white/15">
      <div className="overflow-hidden rounded-[1.25rem] bg-white">
        <div className="flex justify-center bg-bg py-1.5" aria-hidden>
          <span className="h-1.5 w-10 rounded-full bg-white/30" />
        </div>
        {maxScreenHeight ? (
          <div className="relative overflow-hidden bg-white" style={{ height: maxScreenHeight }}>
            <Image src={shot.src} alt={shot.alt} fill sizes={sizes} className="object-cover object-top" {...(priority ? { priority: true } : { loading: eager ? "eager" as const : "lazy" as const })} />
          </div>
        ) : (
          <Shot shot={shot} sizes={sizes} eager={eager} priority={priority} />
        )}
      </div>
    </div>
  );
}

export function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}
