"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { leadSchema, maskPhone, businessTypes, type LeadInput } from "@/lib/lead";
import { submitLead } from "@/app/actions/lead";
import { notify } from "@/lib/notify";
import { trackLead } from "@/lib/analytics";

const input = "mt-1.5 min-h-12 w-full rounded-[var(--radius-input)] border border-paper-line bg-white px-4 text-base text-paper-ink outline-none transition-colors placeholder:text-paper-muted/70 focus:border-accent-ink focus:ring-2 focus:ring-accent/40 aria-[invalid=true]:border-danger";

export function LeadForm() {
  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: { name: "", phone: "", website: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const p = submitLead(values).then((r) => { if (!r.ok) throw new Error(r.error); return r; });
    try {
      await notify.promise(p, {
        loading: "Enviando seu pedido...",
        success: "Recebemos! Sua proposta chega em até 24h.",
        error: "Não foi possível enviar agora.",
      });
      trackLead("formulario");
      reset();
    } catch { /* feedback já exibido pelo toast */ }
  });

  const err = (k: keyof LeadInput) => errors[k] && <p role="alert" className="mt-1.5 text-sm font-medium text-danger">{errors[k]?.message as string}</p>;

  return (
    <form onSubmit={onSubmit} noValidate className="surface-light rounded-[var(--radius-block)] p-6 shadow-float sm:p-8" aria-labelledby="lead-title">
      <h3 id="lead-title" className="t-h3">Receba sua proposta grátis</h3>
      <p className="mt-1 text-sm">Leva menos de 1 minuto. Respondemos em até 24h.</p>

      <div className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-paper-ink">Seu nome
          <input {...register("name")} autoComplete="name" aria-invalid={!!errors.name} className={input} placeholder="Como podemos te chamar?" />
          {err("name")}
        </label>
        <label className="block text-sm font-medium text-paper-ink">WhatsApp
          <input {...register("phone", { onChange: (e) => setValue("phone", maskPhone(e.target.value)) })} type="tel" inputMode="tel" autoComplete="tel-national" aria-invalid={!!errors.phone} className={input} placeholder="(21) 99999-9999" />
          {err("phone")}
        </label>
        <label className="block text-sm font-medium text-paper-ink">Tipo de negócio
          <select {...register("business")} defaultValue="" aria-invalid={!!errors.business} className={input}>
            <option value="" disabled>Selecione</option>
            {businessTypes.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          {err("business")}
        </label>
        {/* Honeypot: invisível para humanos */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>Não preencha<input {...register("website")} tabIndex={-1} autoComplete="off" /></label>
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-block mt-6 disabled:opacity-70">
        {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Enviando...</> : <>Quero minha proposta <ArrowRight className="h-5 w-5" aria-hidden /></>}
      </button>
      <p className="mt-3 text-center text-xs">Sem spam e sem compromisso. Usamos seus dados só para a proposta.</p>
    </form>
  );
}
