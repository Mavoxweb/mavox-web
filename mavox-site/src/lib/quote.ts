import { z } from "zod";
import { services } from "@/data/services";

const slugs = services.map((s) => s.slug) as [string, ...string[]];

export const quoteRequestSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome"),
  email: z.string().trim().email("E-mail inválido"),
  phone: z.string().trim().min(8, "Informe seu WhatsApp"),
  company: z.string().trim().optional(),
  services: z.array(z.enum(slugs)).min(1, "Selecione ao menos um serviço"),
  budgetRange: z.enum(["ate-3k", "3k-8k", "8k-20k", "acima-20k", "nao-sei"]).optional(),
  deadline: z.enum(["urgente", "30-dias", "sem-pressa"]).optional(),
  briefing: z.string().trim().max(2000).optional(),
  source: z.string().optional(),
});

export type QuoteRequest = z.infer<typeof quoteRequestSchema>;

export const budgetOptions = [
  { value: "ate-3k", label: "Até R$ 3 mil" },
  { value: "3k-8k", label: "R$ 3 mil a R$ 8 mil" },
  { value: "8k-20k", label: "R$ 8 mil a R$ 20 mil" },
  { value: "acima-20k", label: "Acima de R$ 20 mil" },
  { value: "nao-sei", label: "Ainda não sei" },
] as const;

export const deadlineOptions = [
  { value: "urgente", label: "O quanto antes" },
  { value: "30-dias", label: "Em até 30 dias" },
  { value: "sem-pressa", label: "Sem pressa" },
] as const;
