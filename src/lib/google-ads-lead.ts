import { z } from "zod";

export const googleAdsOfferIds = ["combo", "site", "ads"] as const;

export const googleAdsLeadSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(80, "Nome muito longo"),
  phone: z.string().refine((value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length === 10 || digits.length === 11;
  }, "Informe um WhatsApp válido com DDD"),
  company: z.string().trim().min(2, "Informe a empresa").max(120, "Nome da empresa muito longo"),
  city: z.string().trim().min(2, "Informe a cidade").max(80, "Cidade muito longa"),
  offer: z.enum(googleAdsOfferIds, { errorMap: () => ({ message: "Escolha uma oferta" }) }),
  website: z.string().optional(),
});

export type GoogleAdsLeadInput = z.infer<typeof googleAdsLeadSchema>;
