import type { QuoteRequest } from "./quote";
import type { LeadInput } from "./lead";
import type { GoogleAdsLeadInput } from "./google-ads-lead";

import { offerById } from "@/data/google-ads";
import { services } from "@/data/services";
import { queryOne, run, withTransaction } from "@/lib/db";
import { normalizePhoneE164 } from "@/lib/lead-import";

// Função auxiliar para gerar código MVX-YYYY-NNNN
function generateCode(): string {
  const year = new Date().getFullYear();
  return `MVX-${year}-${String(Math.floor(1000 + Math.random() * 8999)).padStart(4, "0")}`;
}

export async function saveQuoteRequest(input: QuoteRequest): Promise<{ id: string; persisted: boolean }> {
  const id = `tmp-${Date.now().toString(36)}`;

  await withTransaction(async (client) => {
    // 1. Inserir lead
    const leadResult = await client.query<{ id: string }>(
      `INSERT INTO leads (id, name, email, phone, company, source) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5) RETURNING id`,
      [input.name, input.email, input.phone, input.company, input.source]
    );
    const leadId = leadResult.rows[0].id;

    // 2. Criar/atualizar client unificado (source='site', intent='conhecer')
    await client.query(
      `INSERT INTO clients (id, name, email, phone, company, source, intent) 
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'site', 'conhecer')
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         phone = EXCLUDED.phone,
         company = EXCLUDED.company,
         source = CASE WHEN clients.source = 'manual' THEN 'manual' ELSE EXCLUDED.source END
       RETURNING id`,
      [input.name, input.email, input.phone, input.company]
    );

    // 3. Gerar código e criar orçamento
    const code = generateCode();
    const quoteResult = await client.query<{ id: string }>(
      `INSERT INTO quotes (id, code, lead_id, status, briefing, budget_range, deadline_pref, total, valid_until) VALUES (gen_random_uuid(), $1, $2, 'novo', $3, $4, $5, 0, CURRENT_DATE + INTERVAL '30 days') RETURNING id`,
      [code, leadId, input.briefing, input.budgetRange, input.deadline]
    );
    const quoteId = quoteResult.rows[0].id;

    // 4. Inserir itens do orçamento
    for (let i = 0; i < input.services.length; i++) {
      const serviceSlug = input.services[i];
      const service = services.find((s) => s.slug === serviceSlug);
      if (!service) continue;

      // Extrair preço numérico de priceFrom (ex: "R$ 1.490" -> 1490)
      const parsePrice = (str?: string): number => {
        if (!str) return 0;
        const num = str.replace(/[^\d.,]/g, "").replace(",", ".");
        return Math.round(parseFloat(num) * 100); // em centavos
      };

      await client.query(
        `INSERT INTO quote_items (id, quote_id, service_id, description, quantity, unit_price, position) VALUES (gen_random_uuid(), $1, gen_random_uuid(), $2, 1, $3, $4)`,
        [quoteId, service.promise ?? "Serviço de desenvolvimento web", parsePrice(service.priceFrom), i + 1]
      );
    }
  });

  return { id, persisted: true };
}

export async function saveLead(input: Omit<LeadInput, "website">): Promise<{ id: string; persisted: boolean }> {
  await run(
    `INSERT INTO leads (id, name, email, phone, company, source) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
    [input.name, null, input.phone, null, input.business]
  );

  return { id: `lead-${Date.now().toString(36)}`, persisted: true };
}

function isUniqueViolation(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  if ("code" in err && (err as { code?: string }).code === "23505") return true;
  return "cause" in err ? isUniqueViolation((err as { cause?: unknown }).cause) : false;
}

/**
 * Grava o lead da LP /google-ads na tabela `clients`, que é a lista do painel
 * e a fonte de "leads recentes" do dashboard. A tabela `leads` exige e-mail
 * (NOT NULL) e esta LP não pede e-mail, então não abrimos orçamento nem
 * inventamos um endereço. WhatsApp repetido atualiza o cliente existente
 * (índice único em phone_e164).
 */
export async function saveGoogleAdsLead(input: Omit<GoogleAdsLeadInput, "website">): Promise<{ id: string }> {
  const offer = offerById(input.offer);
  const phoneE164 = normalizePhoneE164(input.phone);
  const note = `LP /google-ads (Black November). Oferta: ${offer.name} (${offer.price}). Cidade: ${input.city}.`;
  const whatsappLink = phoneE164 ? `https://wa.me/${phoneE164.replace("+", "")}` : null;
  const params = [input.name, input.phone, phoneE164, input.company, input.city, note, offer.service, offer.code, whatsappLink];

  const insertSql = `INSERT INTO clients (
      name, phone, phone_e164, company, city, source, intent, notes,
      recommended_service, offer_code, whatsapp_status, whatsapp_link, sources
    ) VALUES (
      $1, $2, $3, $4, $5, 'google-ads', 'avaliando', $6,
      $7, $8, 'confirmado', $9, '["google-ads"]'::jsonb
    ) RETURNING id`;

  try {
    const created = await queryOne<{ id: string }>(insertSql, params);
    if (!created) throw new Error("Falha ao gravar lead");
    return { id: created.id };
  } catch (err) {
    if (!isUniqueViolation(err) || !phoneE164) throw err;
    const updated = await queryOne<{ id: string }>(
      `UPDATE clients SET
         name = $1,
         phone = $2,
         company = $4,
         city = $5,
         source = 'google-ads',
         intent = CASE WHEN intent = 'pronto_para_contratar' THEN intent ELSE 'avaliando' END,
         notes = CASE
           WHEN notes IS NULL OR btrim(notes) = '' THEN $6
           ELSE notes || E'\\n' || $6
         END,
         recommended_service = $7,
         offer_code = $8,
         whatsapp_status = 'confirmado',
         whatsapp_link = $9,
         sources = CASE
           WHEN sources @> '["google-ads"]'::jsonb THEN sources
           ELSE sources || '["google-ads"]'::jsonb
         END,
         updated_at = now()
       WHERE phone_e164 = $3
       RETURNING id`,
      params,
    );
    if (!updated) throw err;
    return { id: updated.id };
  }
}