"use client";
import { useState, type FormEvent } from "react";
import { services } from "@/data/services";
import { budgetOptions, deadlineOptions } from "@/lib/quote";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { WhatsAppLink } from "./WhatsAppLink";
import { notify } from "@/lib/notify";
import { trackLead } from "@/lib/analytics";
import { claimCopy } from "@/data/claims";

const field = "mt-1.5 min-h-12 w-full rounded-[var(--radius-input)] border border-paper-line bg-white px-4 py-3 text-base text-paper-ink outline-none transition focus:border-accent-ink focus:ring-2 focus:ring-accent/40";

export function QuoteForm({ initialService }: { initialService?: string }) {
  const initialName = services.find((s) => s.slug === initialService)?.name;
  const [selected, setSelected] = useState<string[]>(initialService ? [initialService] : []);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const toggle = (slug: string) => setSelected((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get("name"), email: fd.get("email"), phone: fd.get("phone"),
      company: fd.get("company") || undefined,
      services: selected,
      budgetRange: fd.get("budgetRange") || undefined,
      deadline: fd.get("deadline") || undefined,
      briefing: fd.get("briefing") || undefined,
      source: document.referrer || "direto",
    };
    try {
      const res = await fetch("/api/orcamentos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok) { setState("done"); trackLead("formulario"); notify.success(claimCopy.quoteToast); }
      else { setErrors(data.errors ?? {}); setState("error"); notify.error("Revise os campos destacados."); }
    } catch { setState("error"); }
  }

  if (state === "done") {
    return (
      <div role="status" className="rounded-[var(--radius-block)] bg-white p-10 text-center shadow-lg">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent/15 text-accent-ink"><Check className="h-8 w-8" aria-hidden /></span>
        <h2 className="mt-5 text-2xl font-extrabold">Pedido recebido!</h2>
        <p className="mt-2">{claimCopy.quoteDone}</p>
        <WhatsAppLink message="Olá! Acabei de pedir um orçamento pelo site." className="btn btn-primary mt-6"><MessageCircle className="h-5 w-5" aria-hidden /> Falar no WhatsApp</WhatsAppLink>
      </div>
    );
  }

  const err = (k: string) => errors[k]?.[0] && <p className="mt-1 text-sm text-danger">{errors[k][0]}</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-7 rounded-[var(--radius-block)] bg-white p-6 shadow-lg sm:p-9" noValidate>
      <fieldset>
        <legend className="font-display text-lg font-bold text-paper-ink">1. O que você precisa?</legend>
        <p className="text-sm">Marque quantos quiser.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {services.map((s) => {
            const on = selected.includes(s.slug);
            return (
              <label key={s.slug} className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${on ? "border-accent-ink bg-accent/10" : "border-paper-line [@media(hover:hover)]:hover:border-surface/40"}`}>
                <input type="checkbox" checked={on} onChange={() => toggle(s.slug)} className="mt-1 h-4 w-4 accent-[#2a7a2d]" />
                <span><strong className="block text-paper-ink">{s.name}</strong><span className="text-sm">{s.deadline}</span></span>
              </label>
            );
          })}
        </div>
        {err("services")}
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-1 font-display text-lg font-bold text-paper-ink">2. Seus dados</legend>
        <label className="text-sm font-medium">Nome*<input name="name" required autoComplete="name" className={field} />{err("name")}</label>
        <label className="text-sm font-medium">Empresa<input name="company" autoComplete="organization" className={field} /></label>
        <label className="text-sm font-medium">E-mail*<input name="email" type="email" required autoComplete="email" className={field} />{err("email")}</label>
        <label className="text-sm font-medium">WhatsApp*<input name="phone" type="tel" required autoComplete="tel" className={field} />{err("phone")}</label>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-1 font-display text-lg font-bold text-paper-ink">3. Sobre o projeto</legend>
        <label className="text-sm font-medium">Investimento previsto
          <select name="budgetRange" defaultValue="" className={field}><option value="">Selecione</option>{budgetOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
        </label>
        <label className="text-sm font-medium">Prazo desejado
          <select name="deadline" defaultValue="" className={field}><option value="">Selecione</option>{deadlineOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
        </label>
        <label className="text-sm font-medium sm:col-span-2">Conte um pouco sobre seu negócio e objetivo
          <textarea name="briefing" rows={4} defaultValue={initialName ? `Olá! Tenho interesse em: ${initialName}.` : ""} className={field} placeholder="Ex.: Somos uma clínica e queremos receber mais agendamentos online." />
        </label>
      </fieldset>

      {state === "error" && Object.keys(errors).length === 0 && <p role="alert" className="text-danger">Não foi possível enviar. Tente novamente ou chame no WhatsApp.</p>}
      <button disabled={state === "sending"} className="btn btn-primary btn-block disabled:opacity-60">
        {state === "sending" ? "Enviando..." : "Receber minha proposta grátis"} <ArrowRight className="h-5 w-5" aria-hidden />
      </button>
      <p className="text-center text-xs">Seus dados são usados apenas para elaborar sua proposta. Sem spam.</p>
    </form>
  );
}

