"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Check, MessageCircle } from "lucide-react";
import { offerById, offers, waMessage, type OfferId } from "@/data/google-ads";
import { googleAdsLeadSchema } from "@/lib/google-ads-lead";
import { maskPhone } from "@/lib/lead";
import { pushEvent } from "@/components/GtmDataLayer";
import { WhatsAppLink } from "@/components/WhatsAppLink";

const field = "mt-1.5 min-h-12 w-full rounded-[var(--radius-input)] border border-paper-line bg-white px-4 text-base text-paper-ink outline-none transition-colors placeholder:text-paper-muted/70 focus:border-accent-ink focus:ring-2 focus:ring-accent/40 aria-[invalid=true]:border-danger";

type Fields = { name: string; phone: string; company: string; city: string; offer: OfferId };

const empty: Fields = { name: "", phone: "", company: "", city: "", offer: "combo" };

export function AdsForm() {
  const [values, setValues] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [formError, setFormError] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const successRef = useRef<HTMLHeadingElement>(null);
  const offerLegendId = useId();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const trigger = target?.closest("[data-offer]") as HTMLElement | null;
      const offer = trigger?.dataset.offer;
      if (offer === "combo" || offer === "site" || offer === "ads") {
        setValues((current) => ({ ...current, offer }));
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (state === "done") successRef.current?.focus();
  }, [state]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const parsed = googleAdsLeadSchema.safeParse({ ...values, website: (event.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "" });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        phone: fieldErrors.phone?.[0],
        company: fieldErrors.company?.[0],
        city: fieldErrors.city?.[0],
        offer: fieldErrors.offer?.[0],
      });
      return;
    }
    setErrors({});
    setState("sending");
    try {
      const res = await fetch("/api/google-ads/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setErrors({
          name: data.errors?.name?.[0],
          phone: data.errors?.phone?.[0],
          company: data.errors?.company?.[0],
          city: data.errors?.city?.[0],
          offer: data.errors?.offer?.[0],
        });
        setFormError(data.error || "Revise os campos e tente de novo.");
        setState("idle");
        return;
      }
      if (!data.ignored) {
        pushEvent({
          event: "generate_lead",
          form_id: "google-ads-lead",
          lead_source: "google-ads",
          offer: parsed.data.offer,
        });
      }
      setState("done");
    } catch {
      setFormError("Não foi possível enviar agora. Chame no WhatsApp.");
      setState("idle");
    }
  }

  if (state === "done") {
    const offer = offerById(values.offer);
    return (
      <div role="status" className="rounded-[var(--radius-block)] bg-white p-8 text-center shadow-lg sm:p-10">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent/15 text-accent-ink">
          <Check className="h-8 w-8" aria-hidden />
        </span>
        <h3 ref={successRef} id="ads-success-title" tabIndex={-1} className="t-h3 mt-5 text-2xl">
          Recebemos seus dados
        </h3>
        <p className="mt-3">
          Vamos chamar {values.name} no WhatsApp para falar sobre {offer.name} ({offer.price}). Se preferir, chame agora.
        </p>
        <WhatsAppLink
          leadEvent={false}
          message={waMessage.success}
          data-track-location="sucesso"
          className="btn btn-primary mt-6"
        >
          <MessageCircle className="h-5 w-5" aria-hidden /> Chamar no WhatsApp
        </WhatsAppLink>
      </div>
    );
  }

  const err = (key: keyof Fields) => errors[key] ? <p id={`${key}-error`} role="alert" className="mt-1.5 text-sm font-medium text-danger">{errors[key]}</p> : null;

  return (
    <form id="google-ads-lead" onSubmit={onSubmit} noValidate className="rounded-[var(--radius-block)] bg-white p-6 shadow-lg sm:p-8" aria-describedby={formError ? "ads-form-error" : undefined}>
      <h3 className="t-h3">Peça o contato</h3>
      <p className="mt-1 text-sm">Nome, WhatsApp, empresa e cidade. Respondemos no WhatsApp.</p>

      <fieldset className="mt-6">
        <legend id={offerLegendId} className="text-sm font-medium text-paper-ink">Oferta</legend>
        <div className="mt-2 grid gap-2" role="radiogroup" aria-labelledby={offerLegendId}>
          {offers.map((offer) => (
            <label key={offer.id} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 ${values.offer === offer.id ? "border-accent-ink bg-accent/10" : "border-paper-line"}`}>
              <input
                type="radio"
                name="offer"
                value={offer.id}
                checked={values.offer === offer.id}
                onChange={() => setValues((current) => ({ ...current, offer: offer.id }))}
                className="h-4 w-4 accent-[#1A1548]"
              />
              <span className="text-sm text-paper-ink"><strong>{offer.name}</strong> · {offer.price}</span>
            </label>
          ))}
        </div>
        {err("offer")}
      </fieldset>

      <div className="mt-4 space-y-4">
        <label className="block text-sm font-medium text-paper-ink">Nome
          <input name="name" autoComplete="name" value={values.name} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} onChange={(e) => setValues((current) => ({ ...current, name: e.target.value }))} className={field} placeholder="Como podemos te chamar?" />
          {err("name")}
        </label>
        <label className="block text-sm font-medium text-paper-ink">WhatsApp
          <input name="phone" type="tel" inputMode="tel" autoComplete="tel-national" value={values.phone} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-error" : undefined} onChange={(e) => setValues((current) => ({ ...current, phone: maskPhone(e.target.value) }))} className={field} placeholder="(DDD) 99999-9999" />
          {err("phone")}
        </label>
        <label className="block text-sm font-medium text-paper-ink">Empresa
          <input name="company" autoComplete="organization" value={values.company} aria-invalid={!!errors.company} aria-describedby={errors.company ? "company-error" : undefined} onChange={(e) => setValues((current) => ({ ...current, company: e.target.value }))} className={field} placeholder="Nome do negócio" />
          {err("company")}
        </label>
        <label className="block text-sm font-medium text-paper-ink">Cidade
          <input name="city" autoComplete="address-level2" value={values.city} aria-invalid={!!errors.city} aria-describedby={errors.city ? "city-error" : undefined} onChange={(e) => setValues((current) => ({ ...current, city: e.target.value }))} className={field} placeholder="Onde você atende" />
          {err("city")}
        </label>
      </div>

      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Não preencha<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      {formError && <p id="ads-form-error" role="alert" className="mt-4 text-sm font-medium text-danger">{formError}</p>}

      <button type="submit" disabled={state === "sending"} className="btn btn-primary btn-block mt-6 disabled:opacity-70">
        {state === "sending" ? "Enviando..." : "Quero que a Mavox me chame"}
      </button>
      <p className="mt-3 text-center text-xs">Sem spam. Usamos esses dados só para retornar este contato.</p>
    </form>
  );
}
