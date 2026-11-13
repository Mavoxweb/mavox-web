import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Bricolage_Grotesque } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, MapPin, MessageCircle, Phone, Search, Store } from "lucide-react";
import { AdsForm } from "@/components/google-ads/AdsForm";
import { HeroMockup } from "@/components/google-ads/HeroMockup";
import { PortfolioCases } from "@/components/google-ads/PortfolioCases";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { CAMPAIGN, faq, founderSentence, GOOGLE_ADS_PATH, offers, pains, steps, waMessage } from "@/data/google-ads";
import { SITE } from "@/lib/site";

const bigShoulders = Big_Shoulders({ subsets: ["latin"], variable: "--font-bigs", weight: ["800", "900"], display: "swap" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-brico", weight: ["400", "500", "700", "800"], display: "swap" });

const tickerItems = [CAMPAIGN.deadlineLabel, CAMPAIGN.paymentLabel, "Site no ar", "Anúncios no Google", "Atendimento no WhatsApp"] as const;

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
  twitter: {
    card: "summary_large_image",
    title,
    description,
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
    <div className={`ads-brand ${bigShoulders.variable} ${bricolage.variable}`}>
      <div className="ads-ticker" aria-hidden>
        <div className="ads-ticker-track">
          {[0, 1].map((copy) => (
            <span key={copy}>
              {tickerItems.map((item, i) => (i === 0 ? <b key={item}>{item}</b> : <span key={item}>✱ {item}</span>))}
              <span>✱</span>
            </span>
          ))}
        </div>
      </div>
      <header className="surface-dark border-b-2 border-line">
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
              <p className="ads-tag">{CAMPAIGN.deadlineLabel}</p>
              <p className="mt-6 text-base text-white">
                <s className="opacity-60">Esperar indicação</s> <span className="font-bold text-accent">Ser encontrado no Google</span>
              </p>
              <h1 className="mt-3 text-white">
                Seu negócio aparecendo no Google: site + anúncios por <span className="hl">R$ 800</span>
              </h1>
              <p className="t-lead mt-6 max-w-xl">
                Site profissional e a configuração da campanha de pesquisa no Google. A oferta de entrada é o combo por <strong className="font-bold text-white">R$ 800</strong>.
              </p>
              <p className="mt-6 text-base text-white">De <s>R$ 1.500</s></p>
              <p className="font-display text-6xl font-black tabular text-accent sm:text-7xl">R$ 800</p>
              <p className="mt-1 text-base text-white">Site profissional + configuração da campanha no Google Ads</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <WhatsAppLink id="hero-cta" leadEvent={false} message={waMessage.hero} data-track-location="hero" className="btn btn-primary">
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

        <section aria-labelledby="dores-title" className="surface-dark section-y">
          <div className="container-x">
            <h2 id="dores-title" className="max-w-4xl">O cliente novo não pode depender de <span className="hl">sorte</span></h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {pains.map((pain, index) => {
                const Icon = painIcons[index];
                return (
                  <article key={pain.title} className="rounded-[var(--radius-card)] border-2 border-accent bg-surface p-6 shadow-[5px_5px_0_var(--color-accent)]">
                    <span className="grid h-11 w-11 place-items-center rounded-md bg-accent text-bg"><Icon className="h-5 w-5" aria-hidden /></span>
                    <h3 className="t-h3 mt-5 text-white">{pain.title}</h3>
                    <p className="mt-2 text-fg-muted">{pain.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section aria-labelledby="como-title" className="surface-light section-y">
          <div className="container-x">
            <h2 id="como-title" className="max-w-3xl">Como <span className="hl">funciona</span></h2>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <li key={step.title} className="rounded-[var(--radius-card)] bg-white p-6 shadow-card">
                  <span className="ads-step">0{index + 1}</span>
                  <h3 className="t-h3 mt-3">{step.title}</h3>
                  <p className="mt-2 text-[15px]">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="precos" aria-labelledby="precos-title" className="surface-light section-y">
          <div className="container-x">
            <h2 id="precos-title">Escolha como <span className="hl">começar</span></h2>
            <p className="t-lead mt-4 max-w-2xl">Escolha o que o seu negócio precisa agora.</p>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {offers.map((offer) => (
                <article key={offer.id} className={`flex flex-col overflow-hidden rounded-[var(--radius-block)] border bg-white shadow-card ${offer.featured ? "border-[3px] border-bg shadow-[8px_8px_0_var(--color-accent)]" : "border-paper-line"}`}>
                  <div className={offer.featured ? "ads-green px-6 pb-5 pt-6" : "px-6 pt-6"}>
                    {offer.badge && <p className="text-xs font-bold uppercase tracking-widest">{offer.badge}</p>}
                    <h3 className="t-h3 mt-2">{offer.name}</h3>
                    {offer.compareAt && <p className="mt-4 text-base">De <s>{offer.compareAt}</s></p>}
                    <p className={`font-display text-6xl font-black tabular text-paper-ink ${offer.compareAt ? "" : "mt-4"}`}>{offer.price}</p>
                    {offer.featured ? <p className="mt-2 text-base font-medium">{CAMPAIGN.comboReturns}</p> : null}
                  </div>
                  <div className="flex flex-1 flex-col px-6 pb-6">
                  {offer.detail ? <p className="mt-4 text-base">{offer.detail}</p> : null}
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

        <section aria-labelledby="prova-title" className="ads-green section-y">
          <div className="container-x">
            <h2 id="prova-title">Experiência do fundador</h2>
            <p className="t-lead mt-5 max-w-3xl font-medium !text-bg">{founderSentence()}</p>
          </div>
        </section>

        <section aria-labelledby="faq-title" className="surface-paper section-y">
          <div className="container-x max-w-3xl">
            <h2 id="faq-title">Dúvidas da <span className="hl">campanha</span></h2>
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
              <h2 id="form-title">Fale com a <span className="hl">Mavox</span></h2>
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
