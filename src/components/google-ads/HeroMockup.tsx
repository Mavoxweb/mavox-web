import Image from "next/image";
import { portfolioCases } from "@/data/portfolio-cases";

const project = portfolioCases.find((item) => item.title === "TGX Engenharia") ?? portfolioCases[0];

/** Notebook e celular com o print da TGX, celular sobreposto ao canto e dentro da moldura. */
export function HeroMockup() {
  const desktop = project.desktop;
  const mobile = project.mobile;
  if (!desktop) return null;

  return (
    <figure className="relative mx-auto w-full max-w-xl" aria-label="Site da TGX Engenharia no notebook e no celular">
      <div className="overflow-hidden rounded-t-2xl border border-white/25 bg-[#1A1548] p-2 shadow-float sm:p-3">
        <div className="mb-2 flex items-center gap-1.5 px-1" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-white/35" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="ml-2 h-5 flex-1 rounded-md bg-white/10" />
        </div>
        <div className="relative aspect-video overflow-hidden rounded-lg bg-white">
          <Image src={desktop.src} alt={desktop.alt} fill priority sizes="(min-width: 1024px) 34rem, 92vw" className="object-cover object-top" />
        </div>
      </div>
      <div className="mx-auto h-3 w-28 rounded-b-md bg-[#1A1548]" aria-hidden />
      <div className="mx-auto h-1.5 w-40 rounded-b-xl bg-[#0085C6]" aria-hidden />
      {mobile ? (
        <div data-device="phone" className="absolute bottom-5 right-1 h-[62%] w-[30%] max-w-[8.25rem] sm:right-2">
          <div className="h-full rounded-[1.15rem] bg-[#1A1548] p-1 shadow-float">
            <div className="relative h-full overflow-hidden rounded-[0.9rem] bg-white">
              <Image src={mobile.src} alt="" fill sizes="132px" className="object-cover object-top" />
            </div>
          </div>
        </div>
      ) : null}
    </figure>
  );
}
