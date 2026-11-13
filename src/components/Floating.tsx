"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { GOOGLE_ADS_PATH, waMessage } from "@/data/google-ads";
import { WhatsAppLink } from "./WhatsAppLink";

/** WhatsApp flutuante + barra inferior mobile. Ambos somem perto do CTA final. */
export function Floating() {
  const [heroGone, setHeroGone] = useState(false);
  const [hasHero, setHasHero] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  const campaign = usePathname() === GOOGLE_ADS_PATH;

  useEffect(() => {
    const hero = document.getElementById("hero");
    const cta = document.getElementById("contato");
    setHasHero(!!hero);
    const ios: IntersectionObserver[] = [];
    if (hero) { const io = new IntersectionObserver(([e]) => setHeroGone(!e.isIntersecting && e.boundingClientRect.top < 0)); io.observe(hero); ios.push(io); }
    if (cta) { const io = new IntersectionObserver(([e]) => setCtaVisible(e.isIntersecting), { threshold: 0.15 }); io.observe(cta); ios.push(io); }
    return () => ios.forEach((i) => i.disconnect());
  }, []);

  const showBar = campaign || (hasHero && heroGone && !ctaVisible);

  return (
    <div className={campaign ? "ads-brand" : undefined}>
      <div className={`fixed right-4 z-40 transition-[opacity,transform,bottom] duration-300 ${campaign ? "max-lg:hidden" : ""} ${ctaVisible ? "pointer-events-none translate-y-3 opacity-0" : "opacity-100"} ${showBar ? "bottom-[calc(5.25rem+env(safe-area-inset-bottom))]" : "bottom-[calc(1rem+env(safe-area-inset-bottom))]"} lg:bottom-6 lg:right-6`}>
        <div className="group relative">
          <span className="pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-bg px-3 py-2 text-sm font-medium text-white opacity-0 shadow-float transition-opacity [@media(hover:hover)]:lg:block group-hover:opacity-100">Fale com a gente</span>
          <WhatsAppLink aria-label="Falar com a Mavox no WhatsApp" tabIndex={ctaVisible ? -1 : 0}
            leadEvent={!campaign}
            message={campaign ? waMessage.floating : undefined}
            data-track-location="flutuante"
            className="grid h-14 w-14 place-items-center rounded-full bg-[#25d366] text-bg shadow-float transition-transform active:scale-95 [animation:pulse-ring_2.4s_infinite] motion-reduce:animate-none">
            <MessageCircle className="h-7 w-7" aria-hidden />
          </WhatsAppLink>
        </div>
      </div>

      <div aria-hidden={!showBar}
        className={`glass fixed inset-x-0 bottom-0 z-30 px-4 pt-3 transition-transform duration-300 lg:hidden ${showBar ? "translate-y-0" : "translate-y-full"}`}
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        {campaign ? (
          <WhatsAppLink leadEvent={false} message={waMessage.floating} data-track-location="barra-mobile" tabIndex={showBar ? 0 : -1} className="btn btn-primary btn-block !min-h-12">
            <MessageCircle className="h-5 w-5" aria-hidden /> Chamar no WhatsApp
          </WhatsAppLink>
        ) : (
          <Link href="/orcamento" tabIndex={showBar ? 0 : -1} className="btn btn-primary btn-block !min-h-12">Pedir orçamento grátis</Link>
        )}
      </div>
    </div>
  );
}

