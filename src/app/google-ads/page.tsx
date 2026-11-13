import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, MapPin, MessageCircle, Phone, Search, Store } from "lucide-react";
import { AdsForm } from "@/components/google-ads/AdsForm";
import { HeroMockup } from "@/components/google-ads/HeroMockup";
import { PortfolioCases } from "@/components/google-ads/PortfolioCases";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { CAMPAIGN, faq, founderSentence, GOOGLE_ADS_PATH, offers, pains, steps, waMessage } from "@/data/google-ads";
import { SITE } from "@/lib/site";

const title = "Seu negócio aparecendo no Google: site + anúncios por R$ 800";
const description = "Site profissional e configuração da campanha no Google Ads por R$ 800 até 30/11. Só o site por R$ 499. Configuração da campanha por R$ 950. Pagamento no PIX.";

export const viewport: Viewport = { themeColor: "#1A1548" };

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: GOOGLE_ADS_PATH },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  openGraph: {
    title,
    description,
    url: GOOGLE_ADS_PATH,
    type: "website",
    locale: "pt_BR",
  },
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const painIcons = [Store, Search, Phone] as const;

export default function GoogleAdsLandingPage() {
  return (
    <div className="ads-brand">
      <header className="surface-dark border-b border-line">
        <div className="container-x flex h-[4.5rem] items-center justify-between gap-4">
          <Link href="/" aria-label="Mavox, página inicial" className="rounded-lg">
            <Image
              src="/brand/mavox-logo-horizontal-branco.svg"
              alt="Mavox"
              width={851}
              height={252}
              priority
              unoptimized
              className="h-10 w-auto"
            />
          </Link>
          <WhatsAppLink leadEvent={false} message={waMessage.hero} data-track-location="topo" className="btn btn-primary !min-h-11 !px-4 text-sm sm:!px-5">
            <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
          </WhatsAppLink>
        </div>
      </header>

      <main id="main">
        <section id="hero" className="ads-hero">
          <div className="container-x grid items-center gap-10 py-12 lg:grid-cols-[1.15fr_.85fr] lg:py-20">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-3.5 py-1.5 text-base font-medium text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden /> {CAMPAIGN.deadlineLabel}
              </p>
              <h1 className="t-h1 mt-5 text-white">Seu negócio aparecendo no Google: site + anúncios por R$ 800</h1>
              <p className="t-lead mt-5 max-w-xl">
                Site profissional e a configuração da campanha de pesquisa no Google. A oferta de entrada é o combo por <strong className="font-bold text-white">R$ 800</strong>.
              </p>
              <p className="mt-6 text-base text-white">De <s>R$ 1.500</s></p>
              <p className="font-display text-5xl font-extrabold tabular text-accent sm:text-6xl">R$ 800</p>
              <p className="mt-1 text-base text-white">Site profissional + configuração da campanha no Google Ads</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <WhatsAppLink leadEvent={false} message={waMessage.hero} data-track-location="hero" className="btn btn-primary">
                  <MessageCircle className="h-5 w-5" aria-hidden /> Chamar no WhatsApp
                </WhatsAppLink>
                <a href="#formulario" className="btn btn-ghost">Enviar meus dados <ArrowRight className="h-5 w-5" aria-hidden /></a>
              </div>
              <ul className="mt-6 flex flex-col gap-2 text-base text-white">
                {[CAMPAIGN.paymentLabel, CAMPAIGN.comboReturns, "A verba dos anúncios é paga direto ao Google"].map((item) => (
                  <li key={item} className="inline-flex items-center gap-2"><Check className="h-4 w-4 shrink-0 text-accent" aria-hidden />{item}</li>
                ))}
              </ul>
            </div>
            <HeroMockup />
          </div>
        </section>

        <section aria-labelledby="dores-title" className="surface-paper section-y">
          <div className="container-x">
            <h2 id="dores-title" className="t-h2 max-w-3xl">O cliente novo não pode depender de sorte</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {pains.map((pain, index) => {
                const Icon = painIcons[index];
                return (
                  <article key={pain.title} className="rounded-[var(--radius-card)] border border-paper-line bg-white p-6 shadow-card">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-danger/10 text-danger"><Icon className="h-5 w-5" aria-hidden /></span>
                    <h3 className="t-h3 mt-5">{pain.title}</h3>
                    <p className="mt-2">{pain.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section aria-labelledby="como-title" className="surface-light section-y">
          <div className="container-x">
            <h2 id="como-title" className="t-h2 max-w-3xl">Como funciona</h2>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <li key={step.title} className="rounded-[var(--radius-card)] bg-white p-6 shadow-card">
                  <span className="font-display text-base font-bold text-accent-ink">0{index + 1}</span>
                  <h3 className="t-h3 mt-3">{step.title}</h3>
                  <p className="mt-2 text-[15px]">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="precos" aria-labelledby="precos-title" className="surface-light section-y">
          <div className="container-x">
            <h2 id="precos-title" className="t-h2">Escolha como começar</h2>
            <p className="t-lead mt-4 max-w-2xl">Os três preços são desta campanha. O combo é a oferta de entrada.</p>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {offers.map((offer) => (
                <article key={offer.id} className={`flex flex-col overflow-hidden rounded-[var(--radius-block)] border bg-white shadow-card ${offer.featured ? "border-[#4CB748]" : "border-paper-line"}`}>
                  <div className={offer.featured ? "ads-green px-6 pb-5 pt-6" : "px-6 pt-6"}>
                    {offer.badge && <p className="text-xs font-bold uppercase tracking-widest">{offer.badge}</p>}
                    <h3 className="t-h3 mt-2">{offer.name}</h3>
                    {offer.compareAt && <p className="mt-4 text-base">De <s>{offer.compareAt}</s></p>}
                    <p className={`font-display text-4xl font-extrabold tabular text-paper-ink ${offer.compareAt ? "" : "mt-4"}`}>{offer.price}</p>
                    {offer.featured ? <p className="mt-2 text-base font-medium">{CAMPAIGN.comboReturns}</p> : null}
                  </div>
                  <div className="flex flex-1 flex-col px-6 pb-6">
                  <p className="mt-4 text-base">{offer.detail}</p>
                  <ul className="mt-5 space-y-2">
                    {offer.includes.map((item) => (
                      <li key={item} className="flex gap-2 text-base"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" aria-hidden />{item}</li>
                    ))}
                  </ul>
                  <div className="mt-6 grid gap-2">
                    <WhatsAppLink leadEvent={false} message={waMessage[offer.id]} data-track-location={`precos-${offer.id}`} className="btn btn-primary">
                      <MessageCircle className="h-5 w-5" aria-hidden /> WhatsApp
                    </WhatsAppLink>
                    <a href="#formulario" data-offer={offer.id} className="btn btn-outline-dark">Quero este no formulário</a>
                  </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <PortfolioCases />

        <section aria-labelledby="prova-title" className="surface-navy section-y">
          <div className="container-x">
            <h2 id="prova-title" className="t-h2">Experiência do fundador</h2>
            <p className="t-lead mt-4 max-w-3xl text-white">{founderSentence()}</p>
          </div>
        </section>

        <section aria-labelledby="faq-title" className="surface-paper section-y">
          <div className="container-x max-w-3xl">
            <h2 id="faq-title" className="t-h2">Dúvidas da campanha</h2>
            <div className="mt-8 divide-y divide-paper-line overflow-hidden rounded-[var(--radius-card)] border border-paper-line bg-white shadow-card">
              {faq.map((item) => (
                <details key={item.q} className="group px-5 py-1 sm:px-7">
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-display text-base font-bold text-paper-ink sm:text-lg [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span aria-hidden className="text-accent-ink group-open:rotate-45">+</span>
                  </summary>
                  <p className="pb-5 text-[15px] leading-relaxed text-paper-ink">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
        </section>

        <section id="formulario" aria-labelledby="form-title" className="surface-light section-y">
          <div className="container-x grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
            <div>
              <h2 id="form-title" className="t-h2">Fale com a Mavox</h2>
              <p className="t-lead mt-4">Se preferir não preencher, o WhatsApp abre com a mensagem da oferta.</p>
              <WhatsAppLink leadEvent={false} message={waMessage.hero} data-track-location="formulario" className="btn btn-dark mt-6">
                <MessageCircle className="h-5 w-5" aria-hidden /> Abrir WhatsApp
              </WhatsAppLink>
            </div>
            <AdsForm />
          </div>
        </section>
      </main>

      <footer className="surface-dark border-t border-line pb-28 pt-12 text-sm lg:pb-16">
        <div className="container-x grid gap-8 sm:grid-cols-2">
          <div>
            <Image src="/brand/mavox-logo-horizontal-branco.svg" alt="Mavox" width={851} height={252} unoptimized className="h-9 w-auto" />
            <p className="mt-4 max-w-sm">Sites e Google Ads para negócios locais.</p>
            <p className="mt-4 flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />{SITE.address}</p>
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-white">Contato e legal</h2>
            <ul className="mt-3 space-y-1">
              <li>
                <a href={SITE.phoneHref} data-track-location="rodape" className="inline-flex min-h-11 items-center gap-2">
                  <Phone className="h-4 w-4 text-accent" aria-hidden />{SITE.phone}
                </a>
              </li>
              <li><Link href="/privacidade" className="inline-flex min-h-11 items-center">Política de Privacidade</Link></li>
              <li><Link href="/termos" className="inline-flex min-h-11 items-center">Termos de Serviço</Link></li>
            </ul>
          </div>
        </div>
        <p className="container-x mt-10 border-t border-line pt-6 text-xs">© {new Date().getFullYear()} Mavox. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
