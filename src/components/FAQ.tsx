import { faq } from "@/data/content";
import { Accordion } from "./Accordion";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="surface-paper section-y">
      <div className="container-x grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
        <div>
          <h2 id="faq-title" className="t-h2">Dúvidas frequentes</h2>
          <p className="t-lead mt-4">Respostas diretas antes mesmo de você perguntar.</p>
        </div>
        <Accordion items={faq} />
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}
