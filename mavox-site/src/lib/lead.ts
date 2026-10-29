import { z } from "zod";

export const businessTypes = [
  "Saúde e bem-estar", "Comércio e varejo", "Serviços profissionais", "Alimentação",
  "Educação", "Indústria e construção", "Tecnologia", "Outro",
] as const;

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome"),
  phone: z.string().refine((v) => { const n = v.replace(/\D/g, ""); return n.length === 10 || n.length === 11; }, "Informe um WhatsApp válido com DDD"),
  business: z.enum(businessTypes, { errorMap: () => ({ message: "Selecione o tipo de negócio" }) }),
  website: z.string().optional(), // honeypot
});
export type LeadInput = z.infer<typeof leadSchema>;

/** Máscara BR: (21) 99999-9999 */
export function maskPhone(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
