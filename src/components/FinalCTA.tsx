import { Check, MessageCircle } from "lucide-react";
import { CLAIMS, claimCopy } from "@/data/claims";
import { LeadForm } from "./LeadForm";
import { WhatsAppLink } from "./WhatsAppLink";

export function FinalCTA() {
  return (
    <section id="contato" aria-labelledby="cta-title" className="surface-dark section-y relative isolate overflow-hidden">
      <div aria-hidden className="absolute left-1/2 top-0 -z-10 h-72 w-[44rem] max-w-full -translate-x-1/2 rounded-full bg-accent/12 blur-3xl" />
      <div className="container-x grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
        <div>
          {CLAIMS.limitedAgenda ? (
            <p className="inline-flex items-center gap-2 text-sm font-medium text-white"><span className="h-2 w-2 rounded-full bg-accent" aria-hidden /> {claimCopy.agenda}</p>
          ) : null}
          <h2 id="cta-title" className={`t-h2 !text-white ${CLAIMS.limitedAgenda ? "mt-4" : ""}`}>Cada dia sem estratégia digital é cliente indo para o concorrente.</h2>
          <p className="t-lead mt-5 max-w-xl">{claimCopy.finalLead}</p>
          <ul className="mt-6 space-y-2.5 text-white">
            {["Diagnóstico inicial gratuito", claimCopy.finalPoint, "Você só avança quando aprova"].map((t) => (
              <li key={t} className="flex gap-3"><Check className="mt-1 h-5 w-5 shrink-0 text-accent" aria-hidden />{t}</li>
            ))}
          </ul>
          <WhatsAppLink className="btn btn-ghost mt-8"><MessageCircle className="h-5 w-5" aria-hidden /> Prefiro falar no WhatsApp</WhatsAppLink>
        </div>
        <LeadForm />
      </div>
    </section>
  );
}
